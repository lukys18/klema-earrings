/**
 * Vercel API Endpoint: /api/saveChat
 * 
 * This endpoint saves chat interactions to Supabase database.
 * Supports multiple actions for the new database structure:
 * 
 * Actions:
 * 1. "message" - Updates session and appends message to conversation JSONB
 * 2. "recommendation" - Logs product recommendations with individual products
 * 3. "click" - Logs product clicks
 * 4. "end_session" - Marks session as ended with duration
 * 
 * Expected POST request body:
 * {
 *   action: "message" | "recommendation" | "click" | "end_session",
 *   sessionId: string (UUID),
 *   website: string,
 *   userId: string (optional, 32 char identifier),
 *   ... action-specific fields
 * }
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Handle message action - upsert session and append to conversation
 */
async function handleMessage(supabase, data) {
  const {
    sessionId,
    website,
    userId,
    userMessage,
    botResponse,
    messageIndex,
    geoCity,
    emailSubmitted,
    hadProductRecommendation,
    hadProductClick
  } = data;

  // First, try to get existing session
  const { data: existingSession } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  // Prepare new message for conversation array
  const newMessage = {
    index: messageIndex,
    user: userMessage,
    bot: botResponse,
    timestamp: new Date().toISOString()
  };

  if (existingSession) {
    // Update existing session
    const currentConversation = existingSession.conversation || [];
    currentConversation.push(newMessage);

    const updateData = {
      total_messages: currentConversation.length,
      conversation: currentConversation
    };

    // Update flags if they changed to true
    if (emailSubmitted) updateData.email_submitted = true;
    if (hadProductRecommendation) updateData.had_product_recommendation = true;
    if (hadProductClick) updateData.had_product_click = true;
    if (geoCity && !existingSession.geo_city) updateData.geo_city = geoCity;

    const { data: updated, error } = await supabase
      .from('chat_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select();

    if (error) throw error;
    return { action: 'updated', data: updated };
  } else {
    // Create new session
    const sessionData = {
      id: sessionId,
      website: website,
      user_id: userId || null,
      started_at: new Date().toISOString(),
      total_messages: 1,
      conversation: [newMessage],
      geo_city: geoCity || null,
      email_submitted: emailSubmitted || false,
      had_product_recommendation: hadProductRecommendation || false,
      had_product_click: hadProductClick || false,
      duration_seconds: 0
    };

    const { data: inserted, error } = await supabase
      .from('chat_sessions')
      .insert([sessionData])
      .select();

    if (error) throw error;
    return { action: 'created', data: inserted };
  }
}

/**
 * Handle product recommendation action
 */
async function handleRecommendation(supabase, data) {
  const {
    sessionId,
    website,
    userId,
    chatLogId,
    queryText,
    category,
    products // Array of { productId, productName, productUrl, position, price }
  } = data;

  // Insert into chat_product_recommendations
  const { data: recommendation, error: recError } = await supabase
    .from('chat_product_recommendations')
    .insert([{
      session_id: sessionId,
      chat_log_id: chatLogId,
      website: website,
      query_text: queryText || null,
      category: category || null,
      user_id: userId || null,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (recError) throw recError;

  // Insert individual products into chat_recommended_products
  if (products && products.length > 0) {
    const productRecords = products.map((p, index) => ({
      recommendation_id: recommendation.id,
      product_id: p.productId,
      product_name: p.productName || null,
      product_url: p.productUrl || null,
      position: p.position ?? index + 1,
      price: p.price || null,
      was_clicked: false
    }));

    const { error: prodError } = await supabase
      .from('chat_recommended_products')
      .insert(productRecords);

    if (prodError) throw prodError;
  }

  // Update session to mark had_product_recommendation
  await supabase
    .from('chat_sessions')
    .update({ had_product_recommendation: true })
    .eq('id', sessionId);

  return { action: 'recommendation_logged', recommendationId: recommendation.id };
}

/**
 * Handle product click action
 */
async function handleClick(supabase, data) {
  const {
    sessionId,
    website,
    userId,
    productId,
    position,
    recommendationId
  } = data;

  // Insert click record
  const { data: click, error: clickError } = await supabase
    .from('chat_product_clicks')
    .insert([{
      session_id: sessionId,
      product_id: productId,
      position: position || null,
      website: website || null,
      user_id: userId || null,
      clicked_at: new Date().toISOString()
    }])
    .select();

  if (clickError) throw clickError;

  // Update was_clicked in chat_recommended_products if recommendationId provided
  if (recommendationId) {
    await supabase
      .from('chat_recommended_products')
      .update({ was_clicked: true })
      .eq('recommendation_id', recommendationId)
      .eq('product_id', productId);
  }

  // Update session to mark had_product_click
  await supabase
    .from('chat_sessions')
    .update({ had_product_click: true })
    .eq('id', sessionId);

  return { action: 'click_logged', data: click };
}

/**
 * Handle end session action
 */
async function handleEndSession(supabase, data) {
  const { sessionId, durationSeconds } = data;

  const { data: updated, error } = await supabase
    .from('chat_sessions')
    .update({
      ended_at: new Date().toISOString(),
      duration_seconds: durationSeconds || 0
    })
    .eq('id', sessionId)
    .select();

  if (error) throw error;
  return { action: 'session_ended', data: updated };
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests' 
    });
  }

  try {
    const supabase = getSupabaseClient();
    const { action, sessionId, website } = req.body;

    // Validate required fields
    if (!action || !sessionId) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'action and sessionId are required' 
      });
    }

    let result;

    switch (action) {
      case 'message':
        if (!website) {
          return res.status(400).json({ 
            error: 'Bad request',
            message: 'website is required for message action' 
          });
        }
        result = await handleMessage(supabase, req.body);
        break;

      case 'recommendation':
        result = await handleRecommendation(supabase, req.body);
        break;

      case 'click':
        if (!req.body.productId) {
          return res.status(400).json({ 
            error: 'Bad request',
            message: 'productId is required for click action' 
          });
        }
        result = await handleClick(supabase, req.body);
        break;

      case 'end_session':
        result = await handleEndSession(supabase, req.body);
        break;

      default:
        return res.status(400).json({ 
          error: 'Bad request',
          message: `Unknown action: ${action}. Valid actions: message, recommendation, click, end_session` 
        });
    }

    console.log(`✅ Action '${action}' completed successfully:`, result);
    return res.status(200).json({ 
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Error in saveChat API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

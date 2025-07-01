import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

/**
 * Test function to verify Cloud Functions deployment
 */
export const helloWorld = onRequest((request, response) => {
  logger.info('Hello logs!', { structuredData: true });
  response.send('Hello from Astrophysicals Firebase Functions!');
});

/**
 * Function to handle user creation
 * Triggered when a new user document is created
 */
export const onUserCreated = onDocumentCreated(
  'users/{userId}',
  (event) => {
    const userId = event.params.userId;
    const userData = event.data?.data();
    
    logger.info(`New user created: ${userId}`, { userData });
    
    // TODO: Initialize user profile, send welcome notification, etc.
    return null;
  }
);

/**
 * Function to handle connection creation
 * Triggered when a new connection document is created
 */
export const onConnectionCreated = onDocumentCreated(
  'connections/{connectionId}',
  async (event) => {
    const connectionId = event.params.connectionId;
    const connectionData = event.data?.data();
    
    logger.info(`New connection created: ${connectionId}`, { connectionData });
    
    // TODO: Calculate astrological compatibility, generate NFT metadata
    return null;
  }
);

/**
 * HTTP function for astrological calculations
 * This will proxy requests to the astrology API
 */
export const getAstrologyData = onRequest(async (request, response) => {
  try {
    // TODO: Implement astrology API integration
    // This will call external astrology API and cache results
    
    logger.info('Astrology data requested', { 
      method: request.method,
      query: request.query 
    });
    
    response.status(200).json({
      message: 'Astrology function ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in astrology function', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * HTTP function for NFT minting
 * This will handle NFT creation on Aptos blockchain
 */
export const mintNft = onRequest(async (request, response) => {
  try {
    // TODO: Implement NFT minting logic
    // This will create NFT metadata, upload to IPFS, and mint on Aptos
    
    logger.info('NFT mint requested', { 
      method: request.method,
      body: request.body 
    });
    
    response.status(200).json({
      message: 'NFT minting function ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in NFT minting function', error);
    response.status(500).json({ error: 'Internal server error' });
  }
}); 
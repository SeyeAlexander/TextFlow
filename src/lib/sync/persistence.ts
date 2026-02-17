"use client";

/**
 * Persistence utilities for Y.js documents
 */

import * as Y from "yjs";
import { loadDocumentYjsState, saveDocumentYjsState } from "@/actions/sync";

/**
 * Load Y.js document state from database
 */
export async function loadYjsDocument(documentId: string, doc: Y.Doc): Promise<boolean> {
  try {
    const base64State = await loadDocumentYjsState(documentId);

    if (base64State) {
      const state = decodeBase64ToUint8Array(base64State);
      Y.applyUpdate(doc, state);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error loading Y.js document:", error);
    return false;
  }
}

/**
 * Save Y.js document state to database
 */
export async function saveYjsDocument(documentId: string, state: Uint8Array): Promise<boolean> {
  try {
    const base64State = encodeUint8ArrayToBase64(state);
    const result = await saveDocumentYjsState(documentId, base64State);
    return result.success;
  } catch (error) {
    console.error("Error saving Y.js document:", error);
    return false;
  }
}

/**
 * Create an initial Y.js state from Lexical JSON content
 * This is used for migrating existing documents to Y.js
 */
export function createInitialYjsState(): Uint8Array {
  const doc = new Y.Doc();
  // The document will be empty but valid
  // Lexical will populate it when the editor initializes
  return Y.encodeStateAsUpdate(doc);
}

// Utility functions for base64 encoding/decoding
function encodeUint8ArrayToBase64(data: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < data.length; i += chunkSize) {
    binary += String.fromCharCode(...data.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function decodeBase64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

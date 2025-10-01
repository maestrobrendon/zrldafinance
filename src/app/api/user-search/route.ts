'use server';

import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NextResponse } from 'next/server';

/**
 * Searches for users by their name or ztag.
 * This is a simplified example for demonstration. For production, consider
 * using a dedicated search service like Algolia for better performance and scalability.
 *
 * @param {Request} request The incoming request object.
 * @returns {NextResponse} A response containing the search results.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get('q');

  if (!searchQuery || typeof searchQuery !== 'string' || searchQuery.length < 2) {
    return NextResponse.json({ message: 'Search query must be at least 2 characters long.' }, { status: 400 });
  }

  try {
    const usersRef = collection(db, 'users');
    const searchTerm = searchQuery.toLowerCase();

    // Query for ztag (exact match for simplicity, can be expanded)
    const ztagQuery = query(
        usersRef,
        where('ztag', '>=', searchTerm),
        where('ztag', '<=', searchTerm + '\uf8ff'),
        limit(5)
    );

    // Query for name (prefix match)
    const nameQuery = query(
        usersRef,
        where('name', '>=', searchQuery),
        where('name', '<=', searchQuery + '\uf8ff'),
        limit(5)
    );

    const [ztagSnapshot, nameSnapshot] = await Promise.all([
      getDocs(ztagQuery),
      getDocs(nameQuery)
    ]);

    const resultsMap = new Map();

    ztagSnapshot.forEach(doc => {
      const data = doc.data();
      // IMPORTANT: Only return public data
      resultsMap.set(doc.id, {
        id: doc.id,
        name: data.name,
        ztag: data.ztag,
        avatarUrl: data.photoURL,
      });
    });

    nameSnapshot.forEach(doc => {
      const data = doc.data();
      // IMPORTANT: Only return public data
      if (!resultsMap.has(doc.id)) {
        resultsMap.set(doc.id, {
          id: doc.id,
          name: data.name,
          ztag: data.ztag,
          avatarUrl: data.photoURL,
        });
      }
    });

    const results = Array.from(resultsMap.values());

    return NextResponse.json(results);

  } catch (error) {
    console.error('User search failed:', error);
    return NextResponse.json({ message: 'An error occurred during user search.' }, { status: 500 });
  }
}

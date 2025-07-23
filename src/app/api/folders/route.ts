import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'

// GET - get all folders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // 使用扁平化结构：folders collection，通过userId过滤
    const q = query(
      collection(db, 'folders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const folders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    }))

    return NextResponse.json({ folders }, { status: 200 })
  } catch (error) {
    console.error('Error fetching folders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    )
  }
}

// POST - create a new folder
export async function POST(request: NextRequest) {
  try {
    const { name, parentId, userId } = await request.json()

    if (!name || !userId) {
      return NextResponse.json(
        { error: 'Name and user ID are required' },
        { status: 400 }
      )
    }

    // 使用扁平化结构：folders collection
    const newFolderRef = await addDoc(
      collection(db, 'folders'),
      {
        name: name.trim(),
        parentId: parentId || null,
        userId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
    )

    return NextResponse.json(
      {
        success: true,
        folderId: newFolderRef.id,
        name: name.trim(),
        parentId: parentId || null,
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error creating folder:', error)
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    )
  }
}

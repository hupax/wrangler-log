import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

// GET - 获取用户信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const docRef = doc(db, 'users', userId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const userData = docSnap.data()
      return NextResponse.json({
        success: true,
        user: {
          id: docSnap.id,
          ...userData,
        }
      })
    }

    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
  } catch (error) {
    console.error('Error getting user:', error)
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 })
  }
}

// POST - 创建或更新用户信息
export async function POST(request: NextRequest) {
  try {
    const { userId, email, displayName, photoURL } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // 检查用户是否已存在
    const docRef = doc(db, 'users', userId)
    const docSnap = await getDoc(docRef)

    const userData = {
      email: email || '',
      displayName: displayName || '',
      photoURL: photoURL || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    if (!docSnap.exists()) {
      // 创建新用户
      userData.createdAt = serverTimestamp()
    }

    await setDoc(docRef, userData, { merge: true })

    return NextResponse.json({
      success: true,
      message: docSnap.exists() ? 'User updated successfully' : 'User created successfully'
    })
  } catch (error) {
    console.error('Error saving user:', error)
    return NextResponse.json({ error: 'Failed to save user' }, { status: 500 })
  }
}

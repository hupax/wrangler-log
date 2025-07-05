import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'

// save github config
export async function POST(request: NextRequest) {
  try {
    const { userId, config } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // save config to firestore
    await setDoc(doc(db, 'github-config', userId), {
      ...config,
      updatedAt: new Date(),
    })

    return NextResponse.json({ success: true, message: 'Config saved successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error saving GitHub config:', error)
    return NextResponse.json({ error: 'Failed to save GitHub config' }, { status: 500 })
  }
}

// get github config
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // get config from firestore
    const docRef = doc(db, 'github-config', userId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const config = docSnap.data()
      return NextResponse.json({ success: true, config }, { status: 200 })
    }

    return NextResponse.json({ success: false, error: 'Config not found' }, { status: 404 })
  } catch (error) {
    console.error('Error getting GitHub config:', error)
    return NextResponse.json({ error: 'Failed to get GitHub config' }, { status: 500 })
  }
}

// remove github config
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // remove config from firestore
    await deleteDoc(doc(db, 'github-config', userId))

    return NextResponse.json({ success: true, message: 'Config removed successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error removing GitHub config:', error)
    return NextResponse.json({ error: 'Failed to remove GitHub config' }, { status: 500 })
  }
}

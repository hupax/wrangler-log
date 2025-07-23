import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore'

// save github config
export async function POST(request: NextRequest) {
  try {
    const { userId, config } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // 先查询是否已存在该用户的配置
    const q = query(
      collection(db, 'github_configs'),
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      // 更新现有配置
      const existingDoc = querySnapshot.docs[0]
      await setDoc(doc(db, 'github_configs', existingDoc.id), {
        userId,
        ...config,
        updatedAt: new Date(),
      })
    } else {
      // 创建新配置
      await addDoc(collection(db, 'github_configs'), {
        userId,
        ...config,
        updatedAt: new Date(),
      })
    }

    return NextResponse.json(
      { success: true, message: 'Config saved successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error saving GitHub config:', error)
    return NextResponse.json(
      { error: 'Failed to save GitHub config' },
      { status: 500 }
    )
  }
}

// get github config
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

    // 使用query查询用户的GitHub配置
    const q = query(
      collection(db, 'github_configs'),
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const config = querySnapshot.docs[0].data()
      return NextResponse.json({ success: true, config }, { status: 200 })
    }

    return NextResponse.json(
      { success: false, error: 'Config not found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error getting GitHub config:', error)
    return NextResponse.json(
      { error: 'Failed to get GitHub config' },
      { status: 500 }
    )
  }
}

// remove github config
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // 使用query查询用户的GitHub配置
    const q = query(
      collection(db, 'github_configs'),
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'Config not found' },
        { status: 404 }
      )
    }

    // 删除找到的配置文档
    const configDoc = querySnapshot.docs[0]
    await deleteDoc(doc(db, 'github_configs', configDoc.id))

    return NextResponse.json(
      { success: true, message: 'Config removed successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error removing GitHub config:', error)
    return NextResponse.json(
      { error: 'Failed to remove GitHub config' },
      { status: 500 }
    )
  }
}

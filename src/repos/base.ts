import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  Firestore,
  DocumentData,
  WithFieldValue
} from 'firebase/firestore';

// 1. Constrain T to DocumentData (an object with string keys)
export abstract class BaseRepository<T extends DocumentData> {
  protected db: Firestore;
  protected collectionName: string;

  constructor(collectionName: string) {
    this.db = getFirestore();
    this.collectionName = collectionName;
  }

  protected collectionRef() {
    return collection(this.db, this.collectionName);
  }

  protected docRef(id: string) {
    return doc(this.db, this.collectionName, id);
  }

  async getById(id: string): Promise<T | null> {
    const snap = await getDoc(this.docRef(id));
    // It's good practice to include the id in the returned object
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as unknown as T) : null;
  }

  async getAll(): Promise<T[]> {
    const snap = await getDocs(this.collectionRef());
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as unknown as T));
  }

  // 2. T is now compatible with WithFieldValue<DocumentData>
  async set(id: string, data: T): Promise<void> {
    await setDoc(this.docRef(id), data as WithFieldValue<T>);
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(this.docRef(id));
  }

  async findOneByField<K extends keyof T>(
    field: K,
    value: T[K]
  ): Promise<{ id: string; data: T } | null> {
    const q = query(this.collectionRef(), where(field as string, '==', value));
    const snap = await getDocs(q);

    if (snap.empty) return null;

    const docSnap = snap.docs[0];
    return { id: docSnap.id, data: docSnap.data() as T };
  }
}
import Head from 'next/head';
import styles from '../styles/home.module.scss';
import { useState } from 'react';
import { ref, set, get, child } from 'firebase/database';
import { database } from '../services/firebase';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import normalizeEmail from '../utils/normalizeEmail';

export default function Home() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userId, setUserId] = useState('');

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const db = database;
    const dbRef = ref(database);
    const userId = uuidv4();
    setUserId(userId);

    get(child(dbRef, `users/${normalizeEmail(email)}`)).then((snapshot) => {
      if (snapshot.exists()) {
        setSuccess('');
        setError('Já existe um usuário com esse email');
      } else if (name.split(/\W+/).length < 2) {
        setSuccess('');
        setError('Nome precisa ter pelo menos duas palavras');
      } else {
        set(ref(db, 'users/' + normalizeEmail(email)), {
          username: name,
          email: email,
          userId: userId,
        });
        setError('');
        setSuccess('Usuário criado com sucesso');
      }
    });
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Super App</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <div className={styles.userCreation}>
        <h1>Crie seu usuário</h1>

        <form onSubmit={handleCreateUser}>
          <input
            type='email'
            placeholder='E-mail'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type='text'
            placeholder='Nome Completo'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button type='submit'>Criar usuário</button>
        </form>

        {error && <p className={styles.error}>*{error}</p>}
        {success && (
          <>
            <p className={styles.success}>{success}</p>
            <p>
              Você só poderá editar a sua conta através desse link, guarde ele
              bem:{' '}
              <Link href={`/edit/${userId}?email=${email}`}>
                <a>{`/edit/${userId}?email=${email}`}</a>
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

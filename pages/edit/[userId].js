/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ref, set, get, child, remove, update } from 'firebase/database';
import { database } from '../../services/firebase';
import { v4 as uuidv4 } from 'uuid';
import styles from './edit.module.scss';
import normalizeEmail from '../../utils/normalizeEmail';

export const EditUser = () => {
  const router = useRouter();
  const dbRef = ref(database);
  const { userId } = router.query;
  const { email } = router.query;
  const [newEmail, setNewEmail] = useState(email);
  const [newName, setNewName] = useState('');
  const [newUserId, setNewUserId] = useState(userId);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleted, setDeleted] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const newUserId = uuidv4();
    setNewUserId(newUserId);
    get(child(dbRef, `users/${normalizeEmail(email)}`)).then((snapshot) => {
      if (snapshot.exists() && snapshot.val().userId === userId) {
        setUserExists(true);
        setUserData(snapshot.val());
        update(child(dbRef, `users/${normalizeEmail(email)}`), {
          userId: newUserId,
        });
      } else {
        setUserExists(false);
      }
    });
  }, [dbRef, email, userId]);

  const handleEditUser = (e) => {
    e.preventDefault();
    const db = database;

    get(child(dbRef, `users/${normalizeEmail(newEmail)}`)).then((snapshot) => {
      if (snapshot.exists() && snapshot.val().email !== email) {
        setSuccess('');
        setError('Já existe um usuário com esse email');
      } else if (newName.split(/\W+/).length < 2) {
        setSuccess('');
        setError('Nome precisa ter pelo menos duas palavras');
      } else {
        set(ref(db, 'users/' + normalizeEmail(email)), {
          username: newName,
          email: newEmail,
          userId: newUserId,
        });
        setError('');
        setSuccess('Usuário editado com sucesso');
      }
    });
  };

  const handleDeleteUser = () => {
    remove(child(dbRef, `users/${normalizeEmail(email)}`));
    setSuccess('Usuário deletado com sucesso');
    setDeleted(true);
  };

  console.log(userData);

  return (
    <div className={styles.container}>
      {userExists ? (
        <div className={styles.editUser}>
          <h1>
            Olá, <span>{userData.username}!</span>
          </h1>
          <h1>Edite seu usuário</h1>

          <form onSubmit={handleEditUser}>
            <input
              type='email'
              placeholder='E-mail'
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <input
              type='text'
              placeholder='Nome Completo'
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <button type='submit'>Salvar dados</button>
            <button
              className={styles.deleteButton}
              type='button'
              onClick={handleDeleteUser}
            >
              Excluir usuário
            </button>
          </form>
          {error && !deleted && <p className={styles.error}>*{error}</p>}
          {success && (
            <>
              <p className={styles.success}>{success}</p>
              <p>
                Você só poderá editar a sua conta através desse link, guarde ele
                bem:{' '}
                <Link href={`/edit/${newUserId}?email=${newEmail}`}>
                  <a>{`/edit/${newUserId}?email=${newEmail}`}</a>
                </Link>
              </p>
            </>
          )}
          {!success && !deleted && (
            <p>
              Seu novo link de acesso é:
              <Link href={`/edit/${newUserId}?email=${email}`}>
                <a>{`/edit/${newUserId}?email=${email}`}</a>
              </Link>{' '}
              Você só poderá acessar seu perfil através desse link, guarde ele
              com cuidado.
            </p>
          )}
        </div>
      ) : (
        <h1>O seu link expirou</h1>
      )}
    </div>
  );
};

export default EditUser;

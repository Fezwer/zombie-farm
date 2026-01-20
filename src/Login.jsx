import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postAuthRefresh } from './request';

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const res = await postAuthRefresh();
      if (res.ok) {
        navigate('/?start=Game', { replace: true });
      }
    })();
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div
      style={{
        background: 'url("/assets/sign_in.png") no-repeat center/cover',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >

      <button
        onClick={handleLogin}
        style={{
          fontFamily: 'Montserrat_Alternates, sans-serif',
          backgroundColor: 'black',
          color: 'white',
          padding: '15px 25px',
          border: 'none',
          borderRadius: '10px',
          fontSize: '18px',
          cursor: 'pointer',
          marginBottom: '10px',
        }}
      >
        sign in to play!
      </button>


      <span
        onClick={handleBack}
        style={{
          fontFamily: 'Bezier_Sans, sans-serif',
          color: 'black',
          cursor: 'pointer',
          fontSize: '12px',
        }}
      >
        back
      </span>
    </div>
  );
}  
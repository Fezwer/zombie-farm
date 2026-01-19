import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: 'url("/assets/sign_in.png") no-repeat center/cover',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
            backgroundColor: '#191919',       
            padding: '10px',
            borderRadius: '16px',
            width: '250px',
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative',
            alignItems: 'center',

            boxShadow: '0 0 40px 10px rgba(177, 66, 185, 0.5)',
  }}
        >

    
        <div
        style={{
            position: 'relative',
            width: '100%',
            height: '20px',
            marginBottom: '12px',
        }}
        >
        
        <h2
            style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            margin: 0,
            fontFamily: 'Bezier_Sans, sans-serif',
            fontSize: '12px',
            color: '#cccccc',
            fontWeight: 'normal',
            lineHeight: '20px',
            whiteSpace: 'nowrap',
            }}
        >
            log in or sign up
        </h2>

        <span
            onClick={() => navigate(-1)}
            style={{
            position: 'absolute',
            right: '5px',
            top: '0',
            fontSize: '12px',
            cursor: 'pointer',
            color: '#cccccc',
            lineHeight: '20px',
            }}
        >
            x
        </span>
        </div>

        <h3 style={{ 
            color: 'white', 
            margin: 0,
            fontSize: '55px', 
            fontFamily: 'Bezier_Sans, sans-serif',
            marginTop: '-30px',
        }}
            
        >HZF</h3>

        <div
        style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginTop: '-20px',
            alignItems: 'center', 
        }}
        >
                
        <button
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 5px',
            width: '95%',
            borderRadius: '15px',
            border: '0.5px solid #cccccc',
            backgroundColor: 'transparent',
            color: '#cccccc',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: 'Bezier_Sans, sans-serif',
        }}
        >
        <img src="/assets/telegram.png" alt="Telegram" style={{ width: 'auto', height: '20px', marginLeft: '5px'}} />
        telegram
        </button>

        <button
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 5px',
            width: '95%',
            borderRadius: '15px',
            border: '0.5px solid #cccccc',
            backgroundColor: 'transparent',
            color: '#cccccc',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: 'Bezier_Sans, sans-serif',
        }}
         >
        <img src="/assets/user.png" alt="More" style={{ width: 'auto', height: '18px', marginLeft: '5px' }} />
        more options
        </button>
      </div>
    </div>
</div>
  );
}

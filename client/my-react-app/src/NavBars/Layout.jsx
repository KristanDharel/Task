// import { useEffect, useState } from 'react';
// import AdminNavbar from './AdminNavbar';
// import KitchenNavbar from './KitchenNavbar';
// import ReceptionNavbar from './ReceptionNavbar';
// import UserNavbar from './UserNavbar';

// const Layout = ({ children }) => {
//   const [navbar, setNavbar] = useState(null);

//   useEffect(() => {
//     const userData = JSON.parse(localStorage.getItem('user'));
//     if (!userData) return;

//     switch(userData.role.toLowerCase()) {
//       case 'admin':
//         setNavbar(<AdminNavbar />);
//         break;
//       case 'kitchen':
//         setNavbar(<KitchenNavbar />);
//         break;
//       case 'reception':
//         setNavbar(<ReceptionNavbar />);
//         break;
//       default:
//         setNavbar(<UserNavbar />);
//     }
//   }, []);

//   return (
//     <div className="min-h-screen flex flex-col">
//       {navbar}
//       <main className="flex-grow p-4">
//         {children}
//       </main>
//     </div>
//   );
// };

// export default Layout;
import { useEffect, useState } from 'react';
import AdminNavbar from './AdminNavbar';
import KitchenNavbar from './KitchenNavbar';
import ReceptionNavbar from './ReceptionNavbar';
import UserNavbar from './UserNavbar';

const Layout = ({ children }) => {
  const [navbar, setNavbar] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      setNavbar(null);
      return;
    }

    switch(userData.role.toLowerCase()) {
      case 'admin':
        setNavbar(<AdminNavbar />);
        break;
      case 'kitchen':
        setNavbar(<KitchenNavbar />);
        break;
      case 'reception':
        setNavbar(<ReceptionNavbar />);
        break;
      default: // 'user' or any other role
        setNavbar(<UserNavbar />);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {navbar}
      <main className="flex-grow p-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
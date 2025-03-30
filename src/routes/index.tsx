import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Start from '../pages/Start';
import Game from '../pages/Game';

function AppRoutes() {
  return (
    <>
      <BrowserRouter basename={import.meta.env.DEV ? '/' : '/arabic_memory'}>
        <Routes>
          <Route path='/' element={<Start />} />
          <Route path='/*' element={<Start />} />
          <Route path='/game' element={<Game />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default AppRoutes;

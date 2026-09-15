import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { MissionsPage } from './pages/MissionsPage';
import { TrainingPage } from './pages/TrainingPage';
import { PlayPage } from './pages/PlayPage';
import { DailyClosePage } from './pages/DailyClosePage';
import { HistoryPage } from './pages/HistoryPage';
import { ChartsPage } from './pages/ChartsPage';
import { WeaknessPage } from './pages/WeaknessPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/missions" element={<MissionsPage />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/play/:sessionId/:gameId" element={<PlayPage />} />
          <Route path="/daily-close" element={<DailyClosePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/charts" element={<ChartsPage />} />
          <Route path="/weakness" element={<WeaknessPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

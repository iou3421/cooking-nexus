import React from 'react';
import {Navigate,Route,Routes,useLocation} from 'react-router-dom';
import {useAuth} from './context/AuthContext';
import {Loading} from './components/UI';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PantryPage from './pages/PantryPage';
import DiscoverPage from './pages/DiscoverPage';
import RecipePage from './pages/RecipePage';
import FavoritesPage from './pages/FavoritesPage';
import ShoppingPage from './pages/ShoppingPage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';

function RequireAuth(){const {user,initializing}=useAuth();const location=useLocation(); if(initializing)return <Loading label="Starting Cooking Nexus…"/>; return user?<Layout/>:<Navigate to="/login" replace state={{from:location.pathname}}/>;}
function GuestOnly(){const {user,initializing}=useAuth();if(initializing)return <Loading/>;return user?<Navigate to="/" replace/>:<LoginPage/>;}
export default function App(){return <Routes>
 <Route path="/login" element={<GuestOnly/>}/>
 <Route element={<RequireAuth/>}>
  <Route index element={<DashboardPage/>}/><Route path="/pantry" element={<PantryPage/>}/><Route path="/discover" element={<DiscoverPage/>}/>
  <Route path="/recipes/:recipeId" element={<RecipePage/>}/><Route path="/favorites" element={<FavoritesPage/>}/><Route path="/shopping" element={<ShoppingPage/>}/>
  <Route path="/community" element={<CommunityPage/>}/><Route path="/profile" element={<ProfilePage/>}/>
 </Route><Route path="*" element={<Navigate to="/" replace/>}/>
 </Routes>}

import React, { useState } from "react";
import { AppBar, Toolbar, Box, Button, Menu, MenuItem } from '@mui/material';
import { Link, useNavigate } from "react-router";
import {ROLES_KEY, TOKEN_KEY} from "../../utils/constants";
import { useProfile } from "../../hooks/useProfile";
import { deactivate } from "../../hooks/auth";
import logo from "../../assets/logo.png";
import SearchBar from "../SearchBar/SearchBar";
interface NavItem {
    name: string;
    path: string;
    requiresAuth?: boolean;
}

const navItems: NavItem[] = [
    { name: 'Accueil', path: '/' },
    { name: 'Recommandations', path: '/recommendations', requiresAuth: true },
];

type NavBarProps = {
    token: string | null;
    setToken: (token: string | null) => void;
};

const NavBar: React.FC<NavBarProps> = ({ token, setToken }) => {
    const [active, setActive] = useState<string>(navItems[0].name);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const { profile, loading: profileLoading } = useProfile(token);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ROLES_KEY);
        setToken(null);
        setActive(navItems[0].name);
        handleMenuClose();
        navigate('/login');
    };

    const handleDeactivate = async () => {
        const result = await deactivate();
        if (result.success) {
            handleLogout();
        }
    };

    const visibleItems = navItems.filter(item => !item.requiresAuth || token);

    return (
        <AppBar position="sticky" sx={{ backgroundColor: '#000000' }}>
            <Toolbar>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginRight: 'auto' }}>
                    <img src={logo} alt="echoo logo" style={{ height: 40, width: 'auto' }} />
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>Echoo</span>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, marginRight: 2 }}>
                    <SearchBar />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    {visibleItems.map((item) => (
                        <Link key={item.name} to={item.path} style={{ textDecoration: 'none' }}>
                            <Button
                                color="inherit"
                                onClick={() => setActive(item.name)}
                                sx={{
                                    className: active === item.name ? 'navbar-item-active' : 'navbar-item',
                                    fontSize: '0.95rem',
                                }}
                            >
                                {item.name}
                            </Button>
                        </Link>
                    ))}
                </Box>

                {token ? (
                    <Box sx={{ marginLeft: 2 }}>
                        <Button
                            onClick={handleMenuOpen}
                            sx={{ color: 'white', textTransform: 'none' }}
                        >
                            {profileLoading ? 'Chargement...' : profile?.username || 'Menu'}
                        </Button>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                            <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                                Mon profil
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>Déconnexion</MenuItem>
                            <MenuItem onClick={handleDeactivate} sx={{ color: 'red' }}>
                                Désactiver le compte
                            </MenuItem>
                        </Menu>
                    </Box>
                ) : (
                    <Box sx={{ marginLeft: 2 }}>
                        <Button color="inherit" onClick={() => navigate('/login')}>
                            Se connecter
                        </Button>
                        <Button color="inherit" onClick={() => navigate('/register')}>
                            S'inscrire
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;

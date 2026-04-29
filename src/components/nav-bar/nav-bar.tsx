import React from "react";
import { AppBar, Toolbar, Box, Button } from '@mui/material';
import { useNavigate } from "react-router";
import logo from "../../assets/logo.png";
import SearchBar from "../SearchBar/SearchBar";
import {USERNAME_KEY} from "../../utils/constants.ts";

/**
 * Navigation bar component that displays a logo, search bar, and user action buttons.
 */
const NavBar: React.FC = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem(USERNAME_KEY);

    const handleLogoClick = () => {
        navigate('/');
    };

    const handleProfileClick = () => {
        navigate('/profile');
    };

    return (
        <AppBar position="sticky" sx={{ backgroundColor: '#000000' }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Logo to the left */}
                <Box
                    onClick={handleLogoClick}
                    sx={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'opacity 0.2s',
                        '&:hover': {
                            opacity: 0.8,
                        },
                    }}
                >
                    <img
                        src={logo}
                        alt="Logo"
                        style={{ height: '60px', width: 'auto' }}
                    />
                </Box>

                {/* Search bar in the center */}
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', mx: 2 }}>
                    <SearchBar />
                </Box>

                {/* Profile button to the right */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                        color="inherit"
                        onClick={handleProfileClick}
                        sx={{
                            fontSize: '0.95rem',
                            textTransform: 'none',
                            '&:hover': {
                                color: '#a237ff',
                            },
                        }}
                    >
                        {username}
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;

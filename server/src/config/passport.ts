import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User';
import dotenv from 'dotenv';
import { Request } from 'express';

dotenv.config();

// Serialize user to session (not strictly needed since we use JWT, but good for completeness/future session support)
// Even if we use JWT, passport session middleware might try to call this.
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});

// Google Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || 'place_holder_id',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'place_holder_secret',
            callbackURL: '/api/auth/google/callback',
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
            try {
                // Check if user exists by googleId
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                }

                // Check if user exists by email
                if (profile.emails && profile.emails[0].value) {
                    user = await User.findOne({ email: profile.emails[0].value });
                    if (user) {
                        // Link googleId to existing user
                        user.googleId = profile.id;
                        if (!user.avatar) user.avatar = profile.photos?.[0].value || '';
                        await user.save();
                        return done(null, user);
                    }
                }

                // Create new user
                const newUser = new User({
                    name: profile.displayName,
                    email: profile.emails?.[0].value,
                    password: 'oauth-' + Date.now(), // Dummy password, they will login via oauth
                    googleId: profile.id,
                    avatar: profile.photos?.[0].value,
                });

                await newUser.save();
                done(null, newUser);
            } catch (error: any) {
                done(error, undefined);
            }
        }
    )
);

// GitHub Strategy
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID || 'place_holder_id',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || 'place_holder_secret',
            callbackURL: '/api/auth/github/callback',
            scope: ['user:email'],
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
            try {
                // Check by githubId
                let user = await User.findOne({ githubId: profile.id });

                if (user) {
                    return done(null, user);
                }

                // GitHub emails can be private or multiple, fetch primary
                const email = profile.emails?.[0]?.value || `${profile.username}@github.placeholder.com`;

                // Check by email
                user = await User.findOne({ email });
                if (user) {
                    user.githubId = profile.id;
                    if (!user.avatar) user.avatar = profile.photos?.[0].value || '';
                    await user.save();
                    return done(null, user);
                }

                // Create new
                const newUser = new User({
                    name: profile.displayName || profile.username,
                    email: email,
                    password: 'oauth-' + Date.now(),
                    githubId: profile.id,
                    avatar: profile.photos?.[0].value,
                });

                await newUser.save();
                done(null, newUser);

            } catch (error) {
                done(error, undefined);
            }
        }
    )
);

import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import User from "../models/user.model.js";
import calendarIntegration from "../models/calendarIntegration.model.js";
import dotenv from "dotenv";

dotenv.config();
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findOne({ googleId: profile.id });
        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        const calendarIntegration = new calendarIntegration({
          user: user._id,
          provider: "google",
          accessToken,
          refreshToken,
          expiresAt: new Date(Date.now() + 3600 * 1000),
        });
        await calendarIntegration.save();
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

export const authenticateGoogle = passport.authenticate("google", {
  scope: ["profile", "email", "https://www.googleapis.com/auth/calendar"],
});
export const googleCallback = passport.authenticate("google", {
  failureRedirect: "/login",
});

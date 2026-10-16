import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useAuth } from "../auth/AuthContext.js";
import { tokens } from "../theme/theme.js";
export default function Auth({ mode }) {
  const { user, authenticate } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/products" replace />;
  async function submit(event) {
    event.preventDefault(); setError(""); setBusy(true);
    try { await authenticate(mode, { email, password }); navigate(location.state?.from || "/products", { replace: true }); }
    catch (err) { setError(err.response?.data?.message || "Unable to reach the API. Please try again."); }
    finally { setBusy(false); }
  }
  return <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 3, bgcolor: tokens.ink }}>
    <Paper component="form" onSubmit={submit} sx={{ p: 4, width: "100%", maxWidth: 420 }}>
      <Stack spacing={2.5}>
        <Typography variant="h4">Restock</Typography>
        <Typography variant="h6">{mode === "register" ? "Create a customer account" : "Welcome back"}</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
        <TextField label="Password" type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} required
          slotProps={{ htmlInput: { minLength: 10, maxLength: 128 } }} helperText="10–128 characters" value={password} onChange={e => setPassword(e.target.value)} />
        <Button type="submit" variant="contained" disabled={busy}>{busy ? "Please wait…" : mode === "register" ? "Register" : "Sign in"}</Button>
        <Button component={Link} to={mode === "register" ? "/login" : "/register"}>{mode === "register" ? "Already have an account? Sign in" : "Create an account"}</Button>
        <Button component={Link} to="/products">Browse catalog</Button>
      </Stack>
    </Paper>
  </Box>;
}

import React, { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { HomeView } from "./index";

function LogPanel({ children }) {
  return (
    <Box
      component="pre"
      sx={{
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
        fontFamily: "monospace",
        fontSize: "13px",
        lineHeight: 1.6,
        p: 3,
        m: 0,
        maxHeight: "70vh",
        overflow: "auto",
        bgcolor: "grey.900",
        color: "grey.300",
        borderRadius: "0 0 8px 8px",
        border: "1px solid",
        borderColor: "divider",
        borderTop: "none",
      }}
    >
      {children}
    </Box>
  );
}

function MainView() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState("");
  const [errors, setErrors] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (session) {
      const fetchLogs = async () => {
        try {
          const res = await fetch("/api/hal/logs");
          if (!res.ok) {
            throw new Error(`Failed to fetch logs: ${res.status}`);
          }
          const data = await res.json();
          setLogs(data.logs);
          setErrors(data.errors || "No errors.");
        } catch (err) {
          console.error("Error fetching logs:", err);
          setFetchError(err.message);
        }
      };
      fetchLogs();
    }
  }, [session]);

  if (!session) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 10 }}>
        <Typography variant="h4" gutterBottom>
          Access Restricted
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          You need to sign in to view this page.
        </Typography>
        <Button variant="contained" onClick={() => signIn()}>
          Sign In
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", margin: 10 }}>
      <Box sx={{ maxWidth: 1120, width: "100%" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4">HAL Logs</Typography>
          <Button variant="outlined" size="small" onClick={() => signOut()}>
            Sign Out
          </Button>
        </Box>
        {fetchError && (
          <Typography color="error" sx={{ mb: 2 }}>
            {fetchError}
          </Typography>
        )}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Logs" />
            <Tab
              label="Errors"
              sx={{ color: errors && errors !== "No errors." ? "error.main" : undefined }}
            />
          </Tabs>
        </Box>
        <LogPanel>
          {tab === 0 ? logs : errors}
        </LogPanel>
      </Box>
    </Box>
  );
}

export default function Hal() {
  return <HomeView HomeMain={MainView} />;
}

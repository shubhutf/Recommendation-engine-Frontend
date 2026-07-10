import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  TextField,
  CircularProgress,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckIcon from "@mui/icons-material/Check";
import { getAllInventory, updateInventory } from "../mockApi/client.js";
import { tokens } from "../theme/theme.js";

export default function Inventory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [draftQty, setDraftQty] = useState("");

  async function load() {
    setLoading(true);
    setRows(await getAllInventory());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(row) {
    setEditingId(row.productId);
    setDraftQty(String(row.availableQuantity));
  }

  async function saveEdit(productId) {
    await updateInventory(productId, { availableQuantity: Number(draftQty) });
    setEditingId(null);
    load();
  }

  if (loading) {
    return <CircularProgress sx={{ color: tokens.limeDeep }} />;
  }

  return (
    <Box>
      <Typography variant="body2" sx={{ color: tokens.slate, mb: 3 }}>
        Stock levels drive the "Inventory Availability" factor in the recommendation engine —
        in-stock products always outrank out-of-stock ones.
      </Typography>

      <Box sx={{ bgcolor: tokens.card, border: `1px solid ${tokens.line}`, borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Updated</TableCell>
              <TableCell align="center" />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.productId} hover>
                <TableCell sx={{ fontWeight: 600 }}>{row.product?.productName}</TableCell>
                <TableCell>{row.product?.category}</TableCell>
                <TableCell align="right" className="mono">
                  {editingId === row.productId ? (
                    <TextField
                      size="small"
                      type="number"
                      value={draftQty}
                      onChange={(e) => setDraftQty(e.target.value)}
                      sx={{ width: 90 }}
                    />
                  ) : (
                    row.availableQuantity
                  )}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={row.availableQuantity > 0 ? "Available" : "Out of stock"}
                    size="small"
                    sx={{
                      bgcolor: row.availableQuantity > 0 ? "#DFF6C0" : "#FFDCD1",
                      color: tokens.ink,
                    }}
                  />
                </TableCell>
                <TableCell align="right" sx={{ color: tokens.slate }}>
                  {row.updatedAt}
                </TableCell>
                <TableCell align="center">
                  {editingId === row.productId ? (
                    <IconButton size="small" onClick={() => saveEdit(row.productId)}>
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <IconButton size="small" onClick={() => startEdit(row)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
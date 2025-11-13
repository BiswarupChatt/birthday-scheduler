import { Box, TextField, Button } from "@mui/material";
import { Add } from "@mui/icons-material";

export default function EmployeeToolbar({ search, setSearch, onAdd }) {
    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
            <TextField
                label="Search Employee"
                variant="outlined"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: 280 }}
                placeholder="Search by name, phone, id..."
            />
            <Button variant="contained" startIcon={<Add />} onClick={onAdd}>
                Add Employee
            </Button>
        </Box>
    );
}

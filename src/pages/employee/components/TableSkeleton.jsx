// src/features/employee/components/TableSkeleton.jsx
import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Skeleton,
    Box,
    Typography,
} from "@mui/material";

/**
 * Simple table skeleton for loading state.
 * - columnsCount: number of columns (including actions column)
 * - rowsCount: number of rows to show as placeholder
 */
export default function TableSkeleton({ columnsCount = 7, rowsCount = 5 }) {
    const headCells = new Array(columnsCount).fill(null);

    return (
        <Paper>
            <TableContainer>
                <Table size="small" aria-label="loading table skeleton">
                    <TableHead>
                        <TableRow>
                            {headCells.map((_, i) => (
                                <TableCell key={`h-${i}`}>
                                    <Skeleton variant="text" width={i === 0 ? 80 : 120} height={20} />
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {new Array(rowsCount).fill(null).map((_, r) => (
                            <TableRow key={`r-${r}`} hover>
                                {headCells.map((_, c) => (
                                    <TableCell key={`r-${r}-c-${c}`}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            {/* smaller skeleton for "actions" column */}
                                            <Skeleton variant="rectangular" width={c === columnsCount - 1 ? 56 : 120} height={18} />
                                        </Box>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}

                        {/* fallback row if rowsCount is 0 */}
                        {rowsCount === 0 && (
                            <TableRow>
                                <TableCell colSpan={columnsCount} align="center">
                                    <Typography variant="body2">No data</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}

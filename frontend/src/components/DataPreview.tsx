"use client";
import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Search, SlidersHorizontal, Download } from 'lucide-react';

interface DataPreviewProps {
  data: Record<string, string | number | boolean | null>[];
}

export default function DataPreview({ data }: DataPreviewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterColumn, setFilterColumn] = useState('');
  const [filterValue, setFilterValue] = useState('');
  
  const itemsPerPage = 8;

  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);

  // Handle sorting
  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filter and Search Logic
  const processedData = useMemo(() => {
    let result = [...data];

    // Search term across all columns
    if (searchTerm) {
      result = result.filter(row =>
        columns.some(col => 
          String(row[col] ?? '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Specific column filtering
    if (filterColumn && filterValue) {
      result = result.filter(row =>
        String(row[filterColumn] ?? '').toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    // Sorting
    if (sortConfig !== null) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }
        
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (strA > strB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig, filterColumn, filterValue, columns]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage]);

  const exportToCSV = () => {
    const headers = columns.join(',');
    const rows = processedData.map(row => 
      columns.map(col => `"${String(row[col] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "exported_dataset.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-card rounded-xl shadow-sm border border-border overflow-hidden space-y-4 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-6 bg-primary rounded-full" />
          <h2 className="text-xl font-bold text-foreground">Interactive Data Explorer</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 rounded-lg shadow-sm transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV ({processedData.length} rows)
          </button>
        </div>
      </div>

      {/* Filters & Search Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search matching entries..."
            className="w-full pl-9 pr-4 py-2 bg-muted border border-border text-foreground rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex gap-2">
          <select
            className="w-1/2 px-3 py-2 bg-muted border border-border text-foreground rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
            value={filterColumn}
            onChange={(e) => {
              setFilterColumn(e.target.value);
              setFilterValue('');
              setCurrentPage(1);
            }}
          >
            <option value="">Filter by Col...</option>
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Value match..."
            disabled={!filterColumn}
            className="w-1/2 px-3 py-2 bg-muted border border-border text-foreground rounded-lg outline-none focus:ring-2 focus:ring-primary text-sm transition-all disabled:opacity-50"
            value={filterValue}
            onChange={(e) => {
              setFilterValue(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex items-center justify-end text-xs text-muted-foreground">
          Showing {paginatedData.length} of {processedData.length} records
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto border border-border rounded-lg scrollbar-thin">
        <table className="w-full text-sm text-left text-muted-foreground border-collapse">
          <thead className="text-xs text-foreground uppercase bg-muted/75 font-semibold">
            <tr>
              {columns.map(col => (
                <th 
                  key={col} 
                  className="px-4 py-3 border-b border-border cursor-pointer select-none hover:bg-muted/100 transition-colors"
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center gap-1">
                    <span>{col}</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, i) => (
              <tr key={i} className="border-b border-border hover:bg-muted/30 text-foreground/90 transition-colors">
                {columns.map(col => (
                  <td key={col} className="px-4 py-3 whitespace-nowrap text-sm">
                    {row[col] === null || row[col] === undefined ? (
                      <span className="text-muted-foreground/40 italic">null</span>
                    ) : typeof row[col] === 'boolean' ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${row[col] ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'}`}>
                        {String(row[col])}
                      </span>
                    ) : (
                      String(row[col])
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground italic">
                  No records match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="px-3 py-1.5 text-sm bg-muted text-foreground border border-border rounded-lg hover:bg-muted/80 disabled:opacity-40 transition-all"
          >
            Previous
          </button>
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="px-3 py-1.5 text-sm bg-muted text-foreground border border-border rounded-lg hover:bg-muted/80 disabled:opacity-40 transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
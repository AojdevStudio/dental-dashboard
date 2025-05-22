/**
 * @fileoverview Table Component
 * 
 * Accessible table components for displaying structured data
 * with consistent styling and responsive behavior.
 */

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Main table container with overflow handling
 * 
 * @param {React.HTMLAttributes<HTMLTableElement>} props - Table element props
 * @returns {JSX.Element} The table container
 */
const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  )
);
Table.displayName = "Table";

/**
 * Table header container for column headings
 * 
 * @param {React.HTMLAttributes<HTMLTableSectionElement>} props - Table header props
 * @returns {JSX.Element} The table header element
 */
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => <thead ref={ref} className={cn(className)} {...props} />);
TableHeader.displayName = "TableHeader";

/**
 * Table body container for data rows
 * 
 * @param {React.HTMLAttributes<HTMLTableSectionElement>} props - Table body props
 * @returns {JSX.Element} The table body element
 */
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));
TableBody.displayName = "TableBody";

/**
 * Table footer for summary rows or actions
 * 
 * @param {React.HTMLAttributes<HTMLTableSectionElement>} props - Table footer props
 * @returns {JSX.Element} The table footer element
 */
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-border bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

/**
 * Table row with hover and selection states
 * 
 * @param {React.HTMLAttributes<HTMLTableRowElement>} props - Table row props
 * @returns {JSX.Element} The table row element
 */
const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

/**
 * Table heading cell with styling for column headers
 * 
 * @param {React.ThHTMLAttributes<HTMLTableCellElement>} props - Table heading props
 * @returns {JSX.Element} The table heading cell
 */
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

/**
 * Table data cell for row content
 * 
 * @param {React.TdHTMLAttributes<HTMLTableCellElement>} props - Table cell props
 * @returns {JSX.Element} The table data cell
 */
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-3 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-0.5",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

/**
 * Table caption for accessible table descriptions
 * 
 * @param {React.HTMLAttributes<HTMLTableCaptionElement>} props - Table caption props
 * @returns {JSX.Element} The table caption element
 */
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
));
TableCaption.displayName = "TableCaption";

/**
 * Export table components for structured data display
 */
export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };

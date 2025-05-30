/**
 * @file Table Components
 * @description This file provides a collection of accessible and styled table components
 * for displaying structured data. It includes components for the main table,
 * header, body, footer, rows, heading cells, data cells, and caption, all
 * built using `React.forwardRef` for ref forwarding and `cn` for utility class merging.
 * These components aim to offer consistent styling and responsive behavior.
 */

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * @component Table
 * @description The main table container component. It wraps the HTML `<table>` element
 * and includes a `div` wrapper to handle overflow by making the table horizontally scrollable.
 *
 * @param {React.HTMLAttributes<HTMLTableElement>} props - Props for the HTML `<table>` element.
 * @param {string} [props.className] - Additional CSS class names to be applied to the `<table>` element.
 *                                     These are merged with the default styles.
 * @param {React.Ref<HTMLTableElement>} ref - Forwarded ref to the underlying `<table>` element.
 * @returns {JSX.Element} The rendered table container with a scrollable table.
 *
 * @example
 * <Table>
 *   <TableHeader>...</TableHeader>
 *   <TableBody>...</TableBody>
 * </Table>
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
 * @component TableHeader
 * @description A container component for the header section (`<thead>`) of a table.
 * It is intended to wrap `TableRow` components that contain `TableHead` cells.
 *
 * @param {React.HTMLAttributes<HTMLTableSectionElement>} props - Props for the HTML `<thead>` element.
 * @param {string} [props.className] - Additional CSS class names for the `<thead>` element.
 * @param {React.Ref<HTMLTableSectionElement>} ref - Forwarded ref to the underlying `<thead>` element.
 * @returns {JSX.Element} The rendered table header element.
 */
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => <thead ref={ref} className={cn(className)} {...props} />);
TableHeader.displayName = "TableHeader";

/**
 * @component TableBody
 * @description A container component for the body section (`<tbody>`) of a table.
 * It is intended to wrap `TableRow` components that contain `TableCell` data cells.
 *
 * @param {React.HTMLAttributes<HTMLTableSectionElement>} props - Props for the HTML `<tbody>` element.
 * @param {string} [props.className] - Additional CSS class names for the `<tbody>` element.
 * @param {React.Ref<HTMLTableSectionElement>} ref - Forwarded ref to the underlying `<tbody>` element.
 * @returns {JSX.Element} The rendered table body element.
 */
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));
TableBody.displayName = "TableBody";

/**
 * @component TableFooter
 * @description A container component for the footer section (`<tfoot>`) of a table.
 * Often used for summary rows or actions related to the table data.
 *
 * @param {React.HTMLAttributes<HTMLTableSectionElement>} props - Props for the HTML `<tfoot>` element.
 * @param {string} [props.className] - Additional CSS class names for the `<tfoot>` element.
 * @param {React.Ref<HTMLTableSectionElement>} ref - Forwarded ref to the underlying `<tfoot>` element.
 * @returns {JSX.Element} The rendered table footer element.
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
 * @component TableRow
 * @description A component representing a row (`<tr>`) within a table.
 * It includes styling for hover and selection states.
 *
 * @param {React.HTMLAttributes<HTMLTableRowElement>} props - Props for the HTML `<tr>` element.
 * @param {string} [props.className] - Additional CSS class names for the `<tr>` element.
 * @param {React.Ref<HTMLTableRowElement>} ref - Forwarded ref to the underlying `<tr>` element.
 * @returns {JSX.Element} The rendered table row element.
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
 * @component TableHead
 * @description A component representing a header cell (`<th>`) in a table.
 * Typically used within a `TableRow` inside a `TableHeader`.
 * Includes styling for column headers and special handling for checkbox cells.
 *
 * @param {React.ThHTMLAttributes<HTMLTableCellElement>} props - Props for the HTML `<th>` element.
 * @param {string} [props.className] - Additional CSS class names for the `<th>` element.
 * @param {React.Ref<HTMLTableCellElement>} ref - Forwarded ref to the underlying `<th>` element.
 * @returns {JSX.Element} The rendered table heading cell.
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
 * @component TableCell
 * @description A component representing a standard data cell (`<td>`) in a table.
 * Typically used within a `TableRow` inside a `TableBody` or `TableFooter`.
 * Includes styling and special handling for checkbox cells.
 *
 * @param {React.TdHTMLAttributes<HTMLTableCellElement>} props - Props for the HTML `<td>` element.
 * @param {string} [props.className] - Additional CSS class names for the `<td>` element.
 * @param {React.Ref<HTMLTableCellElement>} ref - Forwarded ref to the underlying `<td>` element.
 * @returns {JSX.Element} The rendered table data cell.
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
 * @component TableCaption
 * @description A component representing the caption (`<caption>`) for a table.
 * Used to provide an accessible description or title for the table content.
 *
 * @param {React.HTMLAttributes<HTMLTableCaptionElement>} props - Props for the HTML `<caption>` element.
 * @param {string} [props.className] - Additional CSS class names for the `<caption>` element.
 * @param {React.Ref<HTMLTableCaptionElement>} ref - Forwarded ref to the underlying `<caption>` element.
 * @returns {JSX.Element} The rendered table caption element.
 */
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
));
TableCaption.displayName = "TableCaption";

/**
 * @module table
 * @description Exports all the table-related components for easy import and use
 * in displaying structured data throughout the application.
 */
export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };

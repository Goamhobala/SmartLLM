"use client"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { RequestLogEntry } from "@/lib/dashboard-store"

interface RequestLogProps {
  requests: RequestLogEntry[]
}

function StatusBadge({ status }: { status: RequestLogEntry["status"] }) {
  switch (status) {
    case "verified":
      return <Badge className="border-transparent bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10">Verified</Badge>
    case "review":
      return <Badge className="border-transparent bg-amber-500/10 text-amber-600 hover:bg-amber-500/10">Review</Badge>
    case "cached":
      return <Badge className="border-transparent bg-sky-500/10 text-sky-600 hover:bg-sky-500/10">Cached</Badge>
  }
}

export function RequestLog({ requests }: RequestLogProps) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border p-5">
        <h3 className="text-sm font-semibold text-foreground">Request Log</h3>
        <p className="mt-1 text-xs text-muted-foreground">Real-time feed of all gateway requests</p>
      </div>
      {requests.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          No requests yet. Use the Demo Controls to simulate traffic.
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Time</TableHead>
                <TableHead className="text-xs">Query</TableHead>
                <TableHead className="text-xs">Model</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-right text-xs">Cost</TableHead>
                <TableHead className="text-right text-xs">Latency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req, index) => (
                <TableRow
                  key={req.id}
                  className={index === 0 ? "animate-in fade-in-0 slide-in-from-top-1 bg-accent/5 duration-500" : ""}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">{req.time}</TableCell>
                  <TableCell className="max-w-[240px] truncate text-xs font-medium text-foreground">{req.query}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{req.model}</TableCell>
                  <TableCell><StatusBadge status={req.status} /></TableCell>
                  <TableCell className="text-right font-mono text-xs text-foreground">${req.cost.toFixed(5)}</TableCell>
                  <TableCell className="text-right font-mono text-xs text-muted-foreground">{req.latency}ms</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

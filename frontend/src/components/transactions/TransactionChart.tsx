import { Card, CardBody, Heading, Box, Text } from "@chakra-ui/react";
import { useRef, useEffect } from "react";
import type { TransactionStats } from "../../hooks/transactions/useTransactionsData";
import { formatCurrency } from "../../utils/formatters";

interface TransactionChartProps {
  stats: TransactionStats;
  title: string;
  data:
    | Array<{ date: string; sent: number; received: number }>
    | Array<{ month: string; sent: number; received: number }>;
  dataKey: "date" | "month";
}

export default function TransactionChart({
  title,
  data,
  dataKey,
}: TransactionChartProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.sent, d.received)),
    100 // minimum height
  );

  // Calculate dynamic width based on data length for better spacing
  const chartWidth = Math.max(800, data.length * 80);
  const pointSpacing = Math.max(60, (chartWidth - 120) / Math.max(data.length - 1, 1));

  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
      }, 100);
    }
  }, [data]);

  return (
    <Card.Root bg="white" shadow="lg" borderWidth="1px" borderColor="gray.200">
      <CardBody p={6}>
        <Heading size="lg" mb={6} color="accent">
          {title}
        </Heading>
        {data.length > 0 ? (
          <Box>
            {/* Line chart */}
            <Box h="350px" position="relative">
              <svg
                width="100%"
                height="280px"
                viewBox="0 0 800 280"
                style={{ overflow: "visible" }}
              >
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map((i) => {
                  const y = 40 + i * 50;
                  const value = maxValue - (i * maxValue) / 4;
                  return (
                    <g key={i}>
                      <line
                        x1={60}
                        y1={y}
                        x2={740}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeWidth={1}
                      />
                      <text
                        x={50}
                        y={y + 4}
                        fontSize="10"
                        fill="#718096"
                        textAnchor="end"
                      >
                        {formatCurrency(value)}
                      </text>
                    </g>
                  );
                })}

                {/* Data lines */}
                {data.length > 1 && (
                  <>
                    {/* Sent line */}
                    <polyline
                      points={data
                        .map((item, index) => {
                          const x = 60 + index * (680 / (data.length - 1));
                          const y = 240 - (item.sent / maxValue) * 200;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                      fill="none"
                      stroke="#f56565"
                      strokeWidth={2}
                    />

                    {/* Received line */}
                    <polyline
                      points={data
                        .map((item, index) => {
                          const x = 60 + index * (680 / (data.length - 1));
                          const y = 240 - (item.received / maxValue) * 200;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                      fill="none"
                      stroke="#48bb78"
                      strokeWidth={2}
                    />
                  </>
                )}

                {/* Data points */}
                {data.map((item, index) => {
                  const x = 60 + index * (680 / Math.max(data.length - 1, 1));
                  const sentY = 240 - (item.sent / maxValue) * 200;
                  const receivedY = 240 - (item.received / maxValue) * 200;

                  const label =
                    dataKey === "date"
                      ? new Date((item as any)[dataKey]).toLocaleDateString(
                          "nb-NO",
                          { day: "numeric", month: "short" }
                        )
                      : new Date(
                          (item as any)[dataKey] + "-01"
                        ).toLocaleDateString("nb-NO", { month: "short" });

                  return (
                    <g key={index}>
                      {/* Sent point */}
                      {item.sent > 0 && (
                        <circle cx={x} cy={sentY} r={3} fill="#f56565" />
                      )}

                      {/* Received point */}
                      {item.received > 0 && (
                        <circle cx={x} cy={receivedY} r={3} fill="#48bb78" />
                      )}

                      {/* X-axis label */}
                      <text
                        x={x}
                        y={260}
                        fontSize="10"
                        fill="#718096"
                        textAnchor="middle"
                        transform={`rotate(-45, ${x}, 260)`}
                      >
                        {label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </Box>

            {/* Legend */}
            <Box mt={8} display="flex" gap={4} justifyContent="center">
              <Box display="flex" alignItems="center" gap={2}>
                <Box w="12px" h="12px" bg="red.400" borderRadius="2px" />
                <Text fontSize="sm" color="gray.600">
                  Sent
                </Text>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Box w="12px" h="12px" bg="green.400" borderRadius="2px" />
                <Text fontSize="sm" color="gray.600">
                  Received
                </Text>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box textAlign="center" py={12}>
            <Text color="gray.500" fontSize="lg">
              No transaction data available
            </Text>
          </Box>
        )}
      </CardBody>
    </Card.Root>
  );
}

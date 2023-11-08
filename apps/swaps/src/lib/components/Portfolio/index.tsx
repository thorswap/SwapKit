import { Spinner, Box, Stack, Text, Center } from '@chakra-ui/react';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';

import MiddleEllipsis from '../../components/MiddleEllipsis';
import { usePioneer } from '../../context/Pioneer';

// Register the necessary plugins for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Portfolio({ onClose }) {
  const { state } = usePioneer();
  const { app, balances } = state;
  const [showAll, setShowAll] = useState(false);
  // Add state to track the active segment
  const [activeSegment, setActiveSegment] = useState(null);
  const [totalValueUsd, setTotalValueUsd] = useState(0);
  // State for the chart data
  const [chartData, setChartData] = useState({
    datasets: [],
    labels: [],
  });

  // Options for the Doughnut chart
  const options = {
    responsive: true,
    cutout: '75%', // Adjust to make the doughnut thinner
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              let valueUsd = balances[context.dataIndex].valueUsd.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              });
              label += `${context.parsed.toFixed(2)}%, ${valueUsd}`;
            }
            return label;
          },
        },
      },
      // Custom plugin to draw the value inside the doughnut chart
      beforeDraw: (chart) => {
        const { ctx, tooltip } = chart;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '16px Arial';
        if (tooltip._active && tooltip._active.length) {
          const dataIndex = tooltip._active[0].dataIndex;
          const valuePercent = chartData.datasets[0].data[dataIndex].toFixed(2);
          const valueUsd = balances[dataIndex].valueUsd.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
          });
          ctx.fillText(`${valuePercent}%\n${valueUsd}`, chart.width / 2, chart.height / 2);
        } else {
          ctx.fillText(
            `Total\n$${totalValueUsd.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
            chart.width / 2,
            chart.height / 2,
          );
        }
        ctx.restore();
      },
    },
    // Add event listeners for hovering
    // Add event listeners for hovering
    onHover: (event, chartElement) => {
      // Console log for debugging
      console.log('Hover event triggered', chartElement);
      if (chartElement.length) {
        const index = chartElement[0].index;
        setActiveSegment(index); // Set the active segment index
      } else {
        setActiveSegment(null); // Reset the active segment when not hovering
      }
    },
    maintainAspectRatio: false,
  };

  // Function to handle the click event on the chart
  const handleChartClick = (event, chartElement) => {
    if (chartElement.length) {
      const index = chartElement[0].index;
      const clickedAsset = balances[index];
      console.log(`Clicked on asset: ${clickedAsset.symbol}`);
      // Perform any other action when a segment is clicked
    }
  };

  // Function to get the display text for the center of the doughnut
  const getCenterText = () => {
    if (activeSegment !== null) {
      const valuePercent = chartData.datasets[0].data[activeSegment].toFixed(2);
      const valueUsd = balances[activeSegment].valueUsd.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      });
      return `${valuePercent}%\n${valueUsd}`;
    }
    return `Total\n$${totalValueUsd.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  };

  // Function to update the chart and total value
  const updateChart = () => {
    let filteredBalances = showAll
      ? balances
      : balances.filter((balance) => parseFloat(balance.valueUsd) >= 10);

    // Sort the filtered balances from highest to lowest
    filteredBalances.sort((a, b) => parseFloat(b.valueUsd) - parseFloat(a.valueUsd));

    let totalValue = filteredBalances.reduce(
      (acc, balance) => acc + parseFloat(balance.valueUsd),
      0,
    );
    setTotalValueUsd(totalValue);

    // Map the sorted balances to chart data (percentages) and labels
    let chartData = filteredBalances.map(
      (balance) => (parseFloat(balance.valueUsd) / totalValue) * 100,
    );
    let chartLabels = filteredBalances.map((balance) => balance.symbol);

    // Generate a dynamic set of colors for the chart
    let chartColors = filteredBalances.map((balance, index) => {
      // This is a placeholder function to generate colors, replace with your actual color scheme logic
      return '#' + Math.floor(Math.random() * 16777215).toString(16);
    });

    setChartData({
      datasets: [
        {
          data: chartData,
          backgroundColor: chartColors,
          hoverBackgroundColor: chartColors.map((color) => color + 'B3'), // Lighten color for hover
          borderColor: 'white',
          borderWidth: 2,
        },
      ],
      labels: chartLabels,
    });
  };

  useEffect(() => {
    updateChart();
  }, [balances]);

  useEffect(() => {
    const canvas = document.getElementById('your-chart-canvas-id'); // Make sure to give your canvas an ID
    if (canvas) {
      const chartInstance = Chart.getChart('your-chart-canvas-id'); // Or however you can obtain your chart instance

      const handleHover = (event) => {
        const elements = chartInstance.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false);
        if (elements.length) {
          const firstElement = elements[0];
          // ... handle your hover logic here ...
        }
      };

      canvas.addEventListener('mousemove', handleHover);

      return () => {
        canvas.removeEventListener('mousemove', handleHover);
      };
    }
  }, []);

  if (!balances || balances.length === 0) {
    return (
      <Center height="300px">
        <Text fontSize="md" fontWeight="medium">
          Connecting to your KeepKey...
        </Text>
        <Spinner size="xl" />
        <Text fontSize="md" fontWeight="medium" position="absolute" bottom="30%">
          Building your portfolio. This may take a few seconds...
        </Text>
      </Center>
    );
  }

  return (
    <Stack align="center" direction={{ base: 'column', md: 'row' }} spacing={4}>
      <Box position="relative" height="300px" width="300px">
        {/* Attach the onClick event to the Doughnut component */}
        <Doughnut data={chartData} options={options} onClick={handleChartClick} />
        <Center position="absolute" top="0" right="0" bottom="0" left="0">
          <Text fontSize="lg" fontWeight="bold" textAlign="center">
            {getCenterText()}
          </Text>
        </Center>
      </Box>
      <Box>
        {/* Asset labels with MiddleEllipsis */}
        {chartData.labels.map((label, index) => (
          <Text fontSize="lg" fontWeight="bold" key={label}>
            <MiddleEllipsis>
              <span>
                {label}: {chartData.datasets[0].data[index].toFixed(2)}%
              </span>
            </MiddleEllipsis>
          </Text>
        ))}
      </Box>
    </Stack>
  );
}

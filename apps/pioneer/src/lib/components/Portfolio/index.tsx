// import { ChevronRightIcon } from "@chakra-ui/icons";
import { Box, Center, Text } from '@chakra-ui/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { useState, useEffect } from 'react';
// @ts-ignore
// eslint-disable-next-line import/no-extraneous-dependencies
import { Doughnut } from 'react-chartjs-2';
import { usePioneer } from '../../context/Pioneer';
// Adjust the import path according to your file structure

// Register the necessary plugins for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Portfolio() {
  const { state } = usePioneer();
  const { balances } = state;
  const [showAll, setShowAll] = useState(false);
  const [activeSegment, setActiveSegment] = useState(null);
  const [totalValueUsd, setTotalValueUsd] = useState(0);
  const [chartData, setChartData] = useState({
    datasets: [],
    labels: [],
  });

  const options: any = {
    responsive: true,
    cutout: '75%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label(context: any) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              const valueUsd = balances[
                context.dataIndex
              ].valueUsd.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              });
              label += `${context.parsed.toFixed(2)}%, ${valueUsd}`;
            }
            return label;
          },
        },
      },
    },
    onHover: (event: any, chartElement: any) => {
      console.log('event: ', event);
      if (chartElement.length) {
        const { index } = chartElement[0];
        setActiveSegment(index);
      } else {
        setActiveSegment(null);
      }
    },
    maintainAspectRatio: false,
  };

  const handleChartClick = (event: any, chartElement: any) => {
    console.log('event: ', event);
    if (chartElement.length) {
      const { index } = chartElement[0];
      const clickedAsset = balances[index];
      console.log(`Clicked on asset: ${clickedAsset.symbol}`);
    }
  };

  const updateChart = () => {
    setShowAll(false);

    const filteredBalances = showAll
      ? balances
      : balances.filter((balance: any) => parseFloat(balance.valueUsd) >= 10);

    filteredBalances.sort(
      (a: any, b: any) => parseFloat(b.valueUsd) - parseFloat(a.valueUsd)
    );

    const totalValue = filteredBalances.reduce(
      (acc: any, balance: any) => acc + parseFloat(balance.valueUsd),
      0
    );
    setTotalValueUsd(totalValue);

    const chartData = filteredBalances.map(
      (balance: any) => (parseFloat(balance.valueUsd) / totalValue) * 100
    );
    const chartLabels = filteredBalances.map((balance: any) => balance.symbol);

    const chartColors = filteredBalances.map(
      () => `#${Math.floor(Math.random() * 16777215).toString(16)}`
    );
    const dataSet: any = {
      datasets: [
        {
          data: chartData,
          backgroundColor: chartColors,
          hoverBackgroundColor: chartColors.map((color: any) => `${color}B3`),
          borderColor: 'white',
          borderWidth: 2,
        },
      ],
      labels: chartLabels,
    };
    setChartData(dataSet);
  };

  useEffect(() => {
    console.log('activeSegment: ', activeSegment);
    updateChart();
  }, [balances]);

  return (
    <Box position="relative" height="300px" width="300px">
      <Doughnut
        data={chartData}
        options={options}
        onClick={() => handleChartClick}
      />
      <Center position="absolute" top="0" right="0" bottom="0" left="0">
        <Text fontSize="lg" fontWeight="bold" textAlign="center">
          Total Value: {totalValueUsd.toFixed(2)}
        </Text>
      </Center>
    </Box>
  );
}

import Chart from 'chart.js/auto';
import React, {useEffect, useRef } from 'react';

function LineGraph({time,volumePerSecond}) {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    useEffect(() => {
      
        if (chartRef.current) {
          if (chartInstance.current) {
            chartInstance.current.destroy();
          }  
          const ctx = chartRef.current.getContext('2d');
          chartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
              labels: time,
              datasets: [{
                label: 'Volume per second',
                data: volumePerSecond,
                borderColor: '#97DC21'
              }]
            },
            options: {
                tension:0.4,
              scales: {
                x: {
                  beginAtZero: true,
                  type: 'linear',
                  position: 'bottom',
                  min: 0,
                  title: {
                    display: true,
                    text: 'Time'
                  }
                },
                y: {
                  beginAtZero: true,
                  min: 0,
                  title: {
                    display: true,
                    text: 'Volume per second'
                  }
                }
              }
            }
          });
        }
      }, [time]); 

    return (
        <div>
            <h4>Graph of current blow</h4>
            <canvas  ref={chartRef} ></canvas>
        </div>
    )
}

export default LineGraph;
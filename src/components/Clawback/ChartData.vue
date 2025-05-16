<template>
  <div class="">
    <div class="row q-col-gutter-md">
      <!-- Parent-Child Organization Infractions -->
      <div class="col-12 col-md-6">
        <q-card flat>
          <q-card-section>
            <div ref="treeMapChart"></div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Monthly Clawback Counts by Parent Org -->
      <div class="col-12 col-md-6">
        <q-card flat>
          <q-card-section>
            <div ref="clawbackCountChart"></div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Clawback Amounts Timeline -->
      <div class="col-12">
        <q-card class="bg-grey-2" flat>
          <q-card-section>
            <div  ref="amountChart"></div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue'
import ApexCharts from 'apexcharts'

export default defineComponent({
  name: 'ClawbackAnalytics',

  setup() {
    const treeMapChart = ref(null)
    const clawbackCountChart = ref(null)
    const amountChart = ref(null)

    onMounted(() => {
      // TreeMap Chart
      const treeMapOptions = {
        series: [{
          data: [
            {
              x: 'Parent Org A',
              y: 5,
              fillColor: '#fba700',

            },
            {
              x: 'Parent Org B',
              y: 8,
              fillColor: '#1976D2',

            }
          ]
        }],
        chart: {
          type: 'treemap',
          height: 350
        },
        title: {
          text: 'Organizations with Second Infractions',
          align: 'center'
        },
        tooltip: {
          y: {
            formatter: (value) => `${value} infractions`
          }
        }
      }

      // Clawback Count Chart
      const clawbackCountOptions = {
        series: [
          {
            name: 'Parent Org A',
            data: [3, 5, 2, 8, 4, 6]
          },
          {
            name: 'Parent Org B',
            data: [5, 5, 6, 4, 7, 5]
          },
          {
            name: 'Parent Org C',
            data: [5, 5, 7, 4, 7, 5]
          }
        ],
        chart: {
          type: 'bar',
          height: 350,
          stacked: true
        },
        plotOptions: {
          bar: {
            horizontal: false,
            borderRadius: 10,
            dataLabels: {
              total: {
                enabled: true,
                style: {
                  fontSize: '13px',
                  fontWeight: 900
                }
              }
            }
          }
        },
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        },
        title: {
          text: 'Monthly Clawback Count by Parent Organization',
          align: 'center'
        },
        legend: {
          position: 'right',
          offsetY: 40
        }
      }

      // Amount Timeline Chart
      const amountOptions = {
        series: [
          {
            name: 'Parent Org A',
            data: [45000, 52000, 38000, 74000, 48000, 58000]
          },
          {
            name: 'Parent Org B',
            data: [35000, 41000, 62000, 42000, 58000, 46000]
          }
        ],
        chart: {
          type: 'area',
          height: 350,
          stacked: false
        },
        dataLabels: {
          enabled: true
        },
        stroke: {
          curve: 'smooth'
        },
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        },
        title: {
          text: 'Clawback Amounts Over Time',
          align: 'center'
        },
        yaxis: {
          labels: {
            formatter: (value) => `${value.toLocaleString()} MTn`
          }
        },
        tooltip: {
          y: {
            formatter: (value) => `${value.toLocaleString()} MTn`
          }
        }
      }

      // Initialize charts
      new ApexCharts(treeMapChart.value, treeMapOptions).render()
      new ApexCharts(clawbackCountChart.value, clawbackCountOptions).render()
      new ApexCharts(amountChart.value, amountOptions).render()
    })

    return {
      treeMapChart,
      clawbackCountChart,
      amountChart
    }
  }
})
</script>

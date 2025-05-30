<template>
  <div class="row q-pa-md q-col-gutter-md">
    <div class="col-4">
      <q-card flat class="text-white" style="background-color: #ff1100">
        <q-card-section>
          <!-- Top Description -->
          <div class="row" style="display: flex; align-items: center">
            <div class="col-8">
              <q-chip text-color="white" icon="warning" style="background-color: #ff1100"
                >Potential Risks</q-chip
              >
            </div>
            <div class="col-4" style="text-align: right">
              <q-btn flat dense round color="primary" icon="arrow_right" />
            </div>
          </div>
          <!--/ Top Description -->
          <!-- Main Description -->
          <div class="text-h4 q-pl-md q-mt-lg">
            <b>470</b>
            <q-chip
              size="sm"
              icon="arrow_drop_up"
              color="green"
              text-color="white"
              class="text-subtitle2 q-mt-sm"
            >
              3.2%
            </q-chip>
            <span class="text-subtitle1 text-italic">from last week</span>
          </div>
          <!--/ Main Description -->
        </q-card-section>
      </q-card>
    </div>
    <div class="col-4">
      <q-card flat class="bg-green text-white">
        <q-card-section>
          <!-- Top Description -->
          <div class="row" style="display: flex; align-items: center">
            <div class="col-8">
              <q-chip color="green" text-color="white" icon="group">New Customers</q-chip>
            </div>
            <div class="col-4" style="text-align: right">
              <q-btn flat size="sm" round color="primary" icon="arrow_right" />
            </div>
          </div>
          <!--/ Top Description -->
          <!-- Main Description -->
          <div class="text-h4 q-pl-md q-mt-lg">
            <b>9038</b>
            <q-chip
              size="sm"
              icon="arrow_drop_down"
              color="red"
              text-color="white"
              class="text-subtitle2 q-mt-sm"
            >
              1.4%
            </q-chip>
            <span class="text-subtitle1 text-italic">from last week</span>
          </div>
          <!--/ Main Description -->
        </q-card-section>
      </q-card>
    </div>
    <div class="col-4">
      <q-card flat class="bg-blue text-white">
        <q-card-section>
          <!-- Top Description -->
          <div class="row" style="display: flex; align-items: center">
            <div class="col-8">
              <q-chip color="blue" text-color="white" icon="phishing">Fraude monitoring</q-chip>
            </div>
            <div class="col-4" style="text-align: right">
              <q-btn flat dense round color="primary" icon="arrow_right" />
            </div>
          </div>
          <!--/ Top Description -->
          <!-- Main Description -->
          <div class="text-h4 q-pl-md q-mt-lg">
            <b>38</b>
            <q-chip
              size="sm"
              icon="arrow_left"
              color="orange"
              text-color="white"
              class="text-subtitle2 q-mt-sm"
            >
              0.3%
            </q-chip>
            <span class="text-subtitle1 text-italic">from last week</span>
          </div>
          <!--/ Main Description -->
        </q-card-section>
      </q-card>
    </div>
  </div>

  <!-- Charts -->
  <div class="row q-pa-sm q-col-gutter-md">
    <div class="col-7">
      <div id="chart">
        <apexchart type="bar" height="390" :options="chartOptions" :series="series"></apexchart>
      </div>
    </div>
    <div class="col-5">
      <div id="chart">
        <apexchart
          type="radialBar"
          height="390"
          :options="chartPieOptions"
          :series="pieSeries"
        ></apexchart>
      </div>
    </div>
  </div>
  <div class="div row q-pa-sm q-col-gutter-md">
    <div class="col-7">
      <div id="chart">
        <apexchart
          type="line"
          height="390"
          :options="lineChartOptions"
          :series="lineSeries"
        ></apexchart>
      </div>
    </div>
    <div class="col-5">
      <div id="chart">
        <apexchart type="polarArea" :options="pieChartOptions" :series="pieSseries"></apexchart>
      </div>
    </div>
  </div>
  <!--/ Charts -->
</template>
<script setup>
import { ref } from 'vue'
import ApexCharts from 'vue3-apexcharts'

const series = ref([
  {
    name: 'New Tickets',
    data: [44, 55, 57, 56, 61, 58, 63, 60, 66],
  },
  {
    name: 'Closed Tickets',
    data: [76, 85, 101, 98, 87, 105, 91, 114, 94],
  },
  {
    name: 'Tracker Overdue',
    data: [35, 41, 36, 26, 45, 48, 52, 53, 41],
  },
])
const chartOptions = ref({
  chart: {
    type: 'bar',
    height: 350,
    toolbar: {
      show: false,
    },
  },
  colors: ['#008080', '#2196f3', '#f44336'],
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 5,
      borderRadiusApplication: 'end',
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent'],
  },
  title: {
    text: 'Trackers Flow by Month',
    align: 'left',
  },
  xaxis: {
    categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  },
  fill: {
    opacity: 1,
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return val + ' tickets'
      },
    },
  },
})

const pieSeries = ref([76, 67, 61, 90])
const chartPieOptions = ref({
  chart: {
    height: 390,
    type: 'radialBar',
  },
  plotOptions: {
    radialBar: {
      offsetY: 0,
      startAngle: 0,
      endAngle: 270,
      hollow: {
        margin: 5,
        size: '30%',
        background: 'transparent',
        image: undefined,
      },
      dataLabels: {
        name: {
          show: false,
        },
        value: {
          show: false,
        },
      },
      barLabels: {
        enabled: true,
        useSeriesColors: true,
        offsetX: -8,
        fontSize: '16px',
        formatter: function (seriesName, opts) {
          return seriesName + ':  ' + opts.w.globals.series[opts.seriesIndex]
        },
      },
    },
  },
  colors: ['#1ab7ea', '#0084ff', '#39539E', '#0077B5'],
  labels: ['Vimeo', 'Messenger', 'Facebook', 'LinkedIn'],
  responsive: [
    {
      breakpoint: 480,
      options: {
        legend: {
          show: false,
        },
      },
    },
  ],
})

const lineSeries = ref([
  {
    name: 'Operations',
    data: [10, 41, 35, 51, 49, 32],
  },
  {
    name: 'Finance',
    data: [1, 4, 3, 5, 4, 2],
  },
])
const lineChartOptions = ref({
  chart: {
    height: 350,
    type: 'line',
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
  },
  //   colors: ['#FF5733', '#3375FF'],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'straight',
  },
  title: {
    text: 'Tickets per Department',
    align: 'left',
  },
  grid: {
    row: {
      colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
      opacity: 0.5,
    },
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  },
})

const pieSseries = ref([14, 23, 21, 17, 15, 10, 12, 17, 21])
const pieChartOptions = ref({
  chart: {
    type: 'polarArea',
  },
  stroke: {
    colors: ['#fff'],
  },
  fill: {
    opacity: 0.8,
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 200,
        },
        legend: {
          position: 'bottom',
        },
      },
    },
  ],
})
</script>
<script>
export default {
  components: {
    apexchart: ApexCharts,
  },
}
</script>

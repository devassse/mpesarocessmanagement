<template>
  <q-toolbar class="bg-black text-white">
    <q-toolbar-title>
      {{ reportName || "Report Name" }}
      <em>({{ reportMonth.toString() || " --- " }})</em>
    </q-toolbar-title>
    <q-btn flat round dense icon="person">
      <q-badge floating color="red">2</q-badge>
      <q-tooltip> 2 new modifications </q-tooltip>
    </q-btn>
    <q-btn flat round dense to="/reports" icon="arrow_back">
      <q-tooltip> Go back </q-tooltip>
    </q-btn>
  </q-toolbar>

  <div class="row q-pa-md q-col-gutter-md">
    <div class="col-4">
      <q-card flat class="text-white" style="background-color: #ff1100">
        <q-card-section>
          <!-- Top Description -->
          <div class="row" style="display: flex; align-items: center">
            <div class="col-8">
              <q-chip
                text-color="white"
                icon="warning"
                style="background-color: #ff1100"
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
              <q-chip color="green" text-color="white" icon="group"
                >New Customers</q-chip
              >
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
              <q-chip color="blue" text-color="white" icon="phishing"
                >Fraude monitoring</q-chip
              >
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

  <!-- Report Table -->
  <div class="q-pa-md">
    <q-table
      flat
      square
      :rows="rows"
      :columns="columns"
      bordered
      virtual-scroll
      :rows-per-page-options="[15]"
      row-key="id"
      class="sticky-header-table"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            disable
            size="sm"
            icon="delete"
            color="negative"
            flat
            round
            dense
            @click="removerLinha(props.row)"
          />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { getSingleReportById } from "src/boot/reports";
import { useRoute } from "vue-router";

const route = useRoute();
const reportName = ref("");
const reportMonth = ref("");

const columns = ref([]);
const rows = ref([]);

const removerLinha = (row) => {
  rows.value = rows.value.filter((r) => r.id !== row.id);
};

onMounted(async () => {
  const id = route.params.id;
  getSingleReportById(id)
    .then((response) => {
      console.log("Single Report", response.report);
      //Atribute the response to the variables
      reportName.value = response.report.reportName;
      reportMonth.value = response.report.reportMonth;

      //Columns and Rows
      columns.value = response.report.fileColumns || [];
      rows.value = response.report.fileRows || [];
    })
    .catch((error) => {
      console.error(error);
    });
});
</script>
<style lang="sass">
.sticky-header-table
  .q-table__top,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: #008080
    color: #ffffff

  thead tr th
    position: sticky
    z-index: 1
  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 30px
  thead tr:first-child th
    top: 0

  q-table thead tr,
  .q-table tbody td
    height: 30px;
</style>

// src/components/reports/PolicyActivityPDF.jsx
import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

// Styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  section: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    width: "50%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 4,
  },
  tableCell: {
    fontSize: 10,
  },
});

const PolicyActivityPDF = ({ filters }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.heading}>Policy Activity Report</Text>

        <View style={styles.section}>
          <Text>Territory: {filters.territory}</Text>
          <Text>Division: {filters.division}</Text>
          <Text>Region: {filters.region}</Text>
          <Text>District: {filters.district}</Text>
          <Text>Office: {filters.office}</Text>
          <Text>Type: {filters.type}</Text>
          <Text>SubType: {filters.subType}</Text>
          <Text>Date Range: {filters.startDate.toDateString()} - {filters.endDate.toDateString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={{ fontWeight: "bold", marginBottom: 4 }}>Included Options:</Text>
          <View style={styles.table}>
            {Object.entries(filters.includeOptions).map(([key, value], idx) => (
              <View style={styles.tableRow} key={idx}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{key}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{value ? "Yes" : "No"}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PolicyActivityPDF;

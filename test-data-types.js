const { analyzeDataType } = require('./src/lib/data-analysis');

console.log('='.repeat(70));
console.log('DATA TYPE DETECTION TEST');
console.log('='.repeat(70));

const testCases = [
  {
    name: 'Sales Data',
    headers: ['Date', 'Region', 'Product', 'Revenue', 'Units Sold', 'Customer Count'],
    data: [
      { Date: '2024-01', Region: 'North', Product: 'Widget A', 'Revenue': 15000, 'Units Sold': 150, 'Customer Count': 120 },
      { Date: '2024-02', Region: 'South', Product: 'Widget B', 'Revenue': 18000, 'Units Sold': 180, 'Customer Count': 145 },
      { Date: '2024-03', Region: 'East', Product: 'Widget A', 'Revenue': 22000, 'Units Sold': 220, 'Customer Count': 175 }
    ]
  },
  {
    name: 'Job Listings Data',
    headers: ['Job Title', 'Department', 'Salary Min', 'Salary Max', 'Applications', 'Location'],
    data: [
      { 'Job Title': 'Software Engineer', Department: 'Engineering', 'Salary Min': 80000, 'Salary Max': 120000, Applications: 45, Location: 'Remote' },
      { 'Job Title': 'Product Manager', Department: 'Product', 'Salary Min': 90000, 'Salary Max': 140000, Applications: 32, Location: 'New York' },
      { 'Job Title': 'Designer', Department: 'Design', 'Salary Min': 70000, 'Salary Max': 100000, Applications: 58, Location: 'San Francisco' }
    ]
  },
  {
    name: 'Marketing Campaign Data',
    headers: ['Campaign Name', 'Impressions', 'Clicks', 'Conversions', 'Cost', 'CTR'],
    data: [
      { 'Campaign Name': 'Spring Sale', Impressions: 150000, Clicks: 4500, Conversions: 225, Cost: 5000, CTR: 3.0 },
      { 'Campaign Name': 'Summer Promo', Impressions: 200000, Clicks: 8000, Conversions: 480, Cost: 7500, CTR: 4.0 },
      { 'Campaign Name': 'Fall Launch', Impressions: 180000, Clicks: 5400, Conversions: 324, Cost: 6000, CTR: 3.0 }
    ]
  },
  {
    name: 'Healthcare Data',
    headers: ['Patient ID', 'Admission Date', 'Diagnosis', 'Length of Stay', 'Treatment Cost', 'Department'],
    data: [
      { 'Patient ID': 'P001', 'Admission Date': '2024-01-15', Diagnosis: 'Flu', 'Length of Stay': 3, 'Treatment Cost': 2500, Department: 'General' },
      { 'Patient ID': 'P002', 'Admission Date': '2024-01-16', Diagnosis: 'Surgery', 'Length of Stay': 7, 'Treatment Cost': 15000, Department: 'Surgical' },
      { 'Patient ID': 'P003', 'Admission Date': '2024-01-17', Diagnosis: 'Check-up', 'Length of Stay': 1, 'Treatment Cost': 500, Department: 'General' }
    ]
  },
  {
    name: 'E-Commerce Data',
    headers: ['Product Name', 'Category', 'Price', 'Cart Additions', 'Purchases', 'Returns'],
    data: [
      { 'Product Name': 'Laptop', Category: 'Electronics', Price: 999, 'Cart Additions': 500, Purchases: 125, Returns: 5 },
      { 'Product Name': 'Headphones', Category: 'Electronics', Price: 199, 'Cart Additions': 800, Purchases: 320, Returns: 12 },
      { 'Product Name': 'Backpack', Category: 'Accessories', Price: 49, 'Cart Additions': 1200, Purchases: 600, Returns: 24 }
    ]
  },
  {
    name: 'Employee Performance Data',
    headers: ['Employee Name', 'Department', 'Performance Score', 'Training Hours', 'Projects Completed', 'Leave Days'],
    data: [
      { 'Employee Name': 'John Smith', Department: 'Sales', 'Performance Score': 4.5, 'Training Hours': 40, 'Projects Completed': 8, 'Leave Days': 12 },
      { 'Employee Name': 'Jane Doe', Department: 'Marketing', 'Performance Score': 4.8, 'Training Hours': 35, 'Projects Completed': 10, 'Leave Days': 15 },
      { 'Employee Name': 'Bob Wilson', Department: 'IT', 'Performance Score': 3.9, 'Training Hours': 50, 'Projects Completed': 6, 'Leave Days': 8 }
    ]
  }
];

testCases.forEach(function(testCase) {
  console.log('\n' + '-'.repeat(70));
  console.log('Test: ' + testCase.name);
  console.log('-'.repeat(70));
  
  const result = analyzeDataType(testCase.data, testCase.headers);
  
  console.log('Detected Type: ' + result.label);
  console.log('Description: ' + result.description);
  console.log('Context: ' + result.context);
  console.log('Key Metrics: ' + result.metrics.join(', '));
  console.log('Confidence: ' + (result.confidence * 100).toFixed(1) + '%');
  console.log('Keywords Found: ' + (result.keywords ? result.keywords.map(function(k) { return '[' + k.join(', ') + ']'; }).join(', ') : 'None'));
});

console.log('\n' + '='.repeat(70));
console.log('TEST COMPLETE');
console.log('='.repeat(70));

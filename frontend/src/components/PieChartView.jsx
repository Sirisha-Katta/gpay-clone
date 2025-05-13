// import React, { useEffect, useState, useCallback } from "react";
// import { PieChart, Pie, Cell, Tooltip, Legend, Sector } from "recharts";
// import axios from "axios";
// import "./PieChartView.css"; // Import the CSS file

// const PieChartView = () => {
//   const [data, setData] = useState([]);
//   const [legendData, setLegendData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeIndex, setActiveIndex] = useState(null);
//   const [tooltipContent, setTooltipContent] = useState(null);

//   const fetchData = useCallback(async () => {
//     try {
//       const userId = sessionStorage.getItem("user_id");
//       if (!userId) {
//         throw new Error("No user ID found in sessionStorage.");
//       }

//       const response = await axios.get(`https://gpay-clone.onrender.com/pie-chart-data/${userId}`);
//       console.log("Pie chart API Response:", response.data);

//       if (response.data && Array.isArray(response.data.data)) {
//         const totalAmount = response.data.data.reduce((sum, item) => sum + item.amount, 0);

//         // Group data by domain and generate shades for subcategories
//         const groupedData = response.data.data.reduce((acc, item) => {
//           const { label, subcategory, amount, color } = item;

//           if (!acc[label]) {
//             acc[label] = { baseColor: color, subcategories: [], total: 0 };
//           }
//           acc[label].subcategories.push({ subcategory, amount });
//           acc[label].total = (acc[label].total || 0) + amount;
//           return acc;
//         }, {});
        
//         const legendItems = Object.entries(groupedData).map(([domain, data]) => ({
//           name: domain,
//           color: data.baseColor,
//           value: `${domain} (${((data.total / totalAmount) * 100).toFixed(1)}%)`,
//           total: data.total
//         }));
//         setLegendData(legendItems);
        
//         const formattedData = [];
//         const generateShade = (baseColor, index, total) => {
//           const factor = 1 - (index / (total + 1)) * 0.3; // Reduce brightness by up to 30%
//           const [r, g, b] = baseColor.match(/\w\w/g).map((hex) => parseInt(hex, 16));
//           return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
//         };

//         Object.entries(groupedData).forEach(([domain, { baseColor, subcategories }]) => {
//           subcategories.sort((a, b) => a.subcategory.localeCompare(b.subcategory)); // Sort subcategories alphabetically
//           subcategories.forEach((sub, index) => {
//             formattedData.push({
//               name: sub.subcategory,
//               value: sub.amount,
//               percentage: ((sub.amount / totalAmount) * 100).toFixed(1) + "%",
//               color: generateShade(baseColor, index, subcategories.length),
//               mainCategory: domain,
//             });
//           });
//         });

//         console.log("Formatted Data:", formattedData);
//         setData(formattedData);
//       } else {
//         setData([]);
//       }
//     } catch (err) {
//       console.error("Error fetching data:", err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // Handle pie slice hover/click
//   const onPieEnter = (_, index) => {
//     setActiveIndex(index);

//     // Scroll the corresponding table item into view
//     const element = document.querySelector(`.pie-label-item[data-unique-id="${index}"]`);
//     if (element) {
//       element.scrollIntoView({ behavior: "smooth", block: "nearest" });
//     }

//     // Set tooltip content only for subcategories
//     const hoveredItem = data[index];
//     if (hoveredItem) {
//       setTooltipContent({
//         name: `${hoveredItem.mainCategory} - ${hoveredItem.name}`,
//         value: `₹${new Intl.NumberFormat("en-IN").format(hoveredItem.value)}`,
//         percentage: hoveredItem.percentage,
//         color: hoveredItem.color,
//         isDomain: false,
//       });
//     } else {
//       // Clear tooltip for domains
//       setTooltipContent(null);
//     }
//   };

//   const onPieLeave = () => {
//     setActiveIndex(null);
//     setTooltipContent(null); // Clear tooltip
//   };

//   const handleTableHover = (uniqueId, isDomain, domain, domainTotal, domainPercentage, subcategory, subAmount, subColor) => {
//     if (isDomain) {
//       // Highlight all subcategories of the domain in the pie chart
//       const domainIndices = data
//         .map((item, index) => (item.mainCategory === domain ? index : null))
//         .filter((index) => index !== null);
//       setActiveIndex(domainIndices);

//       // Do not set tooltip for the domain
//       setTooltipContent(null);
//     } else {
//       // Highlight only the specific subcategory in the pie chart
//       setActiveIndex(data.findIndex((item) => item.name === subcategory && item.mainCategory === domain));

//       // Set tooltip for the subcategory
//       setTooltipContent({
//         name: `${domain} - ${subcategory}`,
//         value: `₹${new Intl.NumberFormat("en-IN").format(subAmount)}`,
//         percentage: `${data.find((item) => item.name === subcategory)?.percentage}`,
//         color: subColor,
//         isDomain: false,
//       });
//     }
//   };

//   const handleTableLeave = () => {
//     setActiveIndex(null);
//     setTooltipContent(null); // Clear tooltip
//   };

//   // Custom active shape when a segment is hovered
//   const renderActiveShape = (props) => {
//     const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;

//     return (
//       <g>
//         <Sector
//           cx={cx}
//           cy={cy}
//           innerRadius={innerRadius}
//           outerRadius={outerRadius + 10}
//           startAngle={startAngle}
//           endAngle={endAngle}
//           fill={fill}
//         />
//       </g>
//     );
//   };

//   if (loading) return <p className="loading-message">Loading data...</p>;
//   if (error) return <p className="error-message">{error}</p>;
//   if (data.length === 0) return <p className="no-data-message">No data available for the pie chart.</p>;

//   // This is an alternative approach - create a side label list for all segments
//   const renderLabelList = () => {
//     const groupedByDomain = data.reduce((acc, item) => {
//       if (!acc[item.mainCategory]) {
//         acc[item.mainCategory] = [];
//       }
//       acc[item.mainCategory].push(item);
//       return acc;
//     }, {});

//     return (
//       <div className="pie-label-list">
//         <h3 className="gradient-heading">Expense Details</h3>
//         <ul>
//           {Object.entries(groupedByDomain).map(([domain, subcategories]) => {
//             const domainTotal = subcategories.reduce((sum, sub) => sum + sub.value, 0);
//             const domainPercentage = ((domainTotal / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1) + "%";

//             return (
//               <React.Fragment key={domain}>
//                 <li
//                   className="pie-label-item domain-heading"
//                   style={{
//                     borderLeft: `16px solid ${subcategories[0].color}`,
//                     color: subcategories[0].color,
//                     fontWeight: "bold",
//                   }}
//                   onMouseEnter={() =>
//                     handleTableHover(null, true, domain, domainTotal, domainPercentage, null, null, subcategories[0].color)
//                   }
//                   onMouseLeave={handleTableLeave}
//                 >
//                   <span className="label-name">{domain}</span>
//                   <span className="label-value">
//                     <span className="percentage">{domainPercentage}</span>
//                     <span className="amount">₹{new Intl.NumberFormat("en-IN").format(domainTotal)}</span>
//                   </span>
//                 </li>
//                 {subcategories.map((item, subIndex) => {
//                   console.log("Subcategory Item:", item);
//                   return (
//                     <li
//                       key={`${domain}-${subIndex}`}
//                       className={`pie-label-item ${
//                         activeIndex === data.findIndex((d) => d.name === item.name && d.mainCategory === domain)
//                           ? "active"
//                           : ""
//                       }`}
//                       data-unique-id={data.findIndex((d) => d.name === item.name && d.mainCategory === domain)}
//                       style={{
//                         borderLeft: `4px solid ${item.color}`,
//                         color: item.color,
//                       }}
//                       onMouseEnter={() =>
//                         handleTableHover(
//                           data.findIndex((d) => d.name === item.name && d.mainCategory === domain),
//                           false,
//                           domain,
//                           null,
//                           null,
//                           item.name,
//                           item.value,
//                           item.color
//                         )
//                       }
//                       onMouseLeave={handleTableLeave}
//                     >
//                       <span className="label-name">{item.name}</span>
//                       <span className="label-value">
//                         <span className="percentage">{item.percentage}</span>
//                         <span className="amount">₹{new Intl.NumberFormat("en-IN").format(item.value)}</span>
//                       </span>
//                     </li>
//                   );
//                 })}
//               </React.Fragment>
//             );
//           })}
//         </ul>
//       </div>
//     );
//   };

//   return (
//     <div className="piechart-container">
//       <h2 className="gradient-heading">Spending Breakdown</h2>
//       <div className="piechart-content">
//         <div className="piechart-wrapper">
//           <PieChart width={550} height={400} className="piechart">
//             <Pie
//               data={data}
//               dataKey="value"
//               nameKey="name"
//               cx="50%"
//               cy="50%"
//               outerRadius={150}
//               fill="#8884d8"
//               activeIndex={activeIndex}
//               activeShape={renderActiveShape}
//               onMouseEnter={onPieEnter}
//               onMouseLeave={onPieLeave}
//             >
//               {data.map((entry, index) => (
//                 <Cell
//                   key={`cell-${index}`}
//                   fill={entry.color}
//                   style={{ cursor: "pointer" }}
//                 />
//               ))}
//             </Pie>
//             <Tooltip
//               content={
//                 tooltipContent ? (
//                   <div style={{ backgroundColor: tooltipContent.color, padding: "5px", borderRadius: "5px" }}>
//                     <p style={{ margin: 0, fontWeight: "bold" }}>{tooltipContent.name}</p>
//                     <p style={{ margin: 0 }}>{tooltipContent.value}</p>
//                     <p style={{ margin: 0 }}>{tooltipContent.percentage}</p>
//                   </div>
//                 ) : null
//               }
//             />
//             <Legend
//               layout="horizontal"
//               align="center"
//               verticalAlign="bottom"
//               payload={Object.entries(data.reduce((acc, item) => {
//                 if (!acc[item.mainCategory]) {
//                   acc[item.mainCategory] = {
//                     name: item.mainCategory,
//                     color: item.color,
//                     value: item.mainCategory
//                   };
//                 }
//                 return acc;
//               }, {})).map(([_, item]) => item)}
//               formatter={(value, entry) => (
//                 <span style={{ color: entry.color, fontWeight: 'bold' }}>
//                   {value}
//                 </span>
//               )}
//             />
//           </PieChart>
//         </div>
//         {renderLabelList()}
//       </div>
//     </div>
//   );
// };

// export default PieChartView;

import React, { useEffect, useState, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, Sector } from "recharts";
import axios from "axios";
import "./PieChartView.css"; // Import the CSS file

const PieChartView = () => {
  const [data, setData] = useState([]);
  const [legendData, setLegendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [tooltipContent, setTooltipContent] = useState(null);

  // const fetchData = useCallback(async () => {
  //   try {
  //     const userId = sessionStorage.getItem("user_id");
  //     if (!userId) {
  //       throw new Error("No user ID found in sessionStorage.");
  //     }

  //     const response = await axios.get(`https://gpay-clone.onrender.com/pie-chart-data/${userId}`);
  //     console.log("Pie chart API Response:", response.data);

  //     if (response.data && Array.isArray(response.data.data)) {
  //       const totalAmount = response.data.data.reduce((sum, item) => sum + item.amount, 0);

  //       // Group data by domain and generate shades for subcategories
  //       const groupedData = response.data.data.reduce((acc, item) => {
  //         const { label, subcategory, amount, color } = item;

  //         if (!acc[label]) {
  //           acc[label] = { baseColor: color, subcategories: [], total: 0 };
  //         }
  //         acc[label].subcategories.push({ subcategory, amount });
  //         acc[label].total = (acc[label].total || 0) + amount;
  //         return acc;
  //       }, {});
        
  //       const legendItems = Object.entries(groupedData).map(([domain, data]) => ({
  //         name: domain,
  //         color: data.baseColor,
  //         value: `${domain} (${((data.total / totalAmount) * 100).toFixed(1)}%)`,
  //         total: data.total
  //       }));
  //       setLegendData(legendItems);
        
  //       const formattedData = [];
  //       const generateShade = (baseColor, index, total) => {
  //         const factor = 1 - (index / (total + 1)) * 0.3; // Reduce brightness by up to 30%
  //         const [r, g, b] = baseColor.match(/\w\w/g).map((hex) => parseInt(hex, 16));
  //         return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
  //       };

  //       Object.entries(groupedData).forEach(([domain, { baseColor, subcategories }]) => {
  //         subcategories.sort((a, b) => a.subcategory.localeCompare(b.subcategory)); // Sort subcategories alphabetically
  //         subcategories.forEach((sub, index) => {
  //           formattedData.push({
  //             name: sub.subcategory,
  //             value: sub.amount,
  //             percentage: ((sub.amount / totalAmount) * 100).toFixed(1) + "%",
  //             color: generateShade(baseColor, index, subcategories.length),
  //             mainCategory: domain,
  //           });
  //         });
  //       });

  //       console.log("Formatted Data:", formattedData);
  //       setData(formattedData);
  //     } else {
  //       setData([]);
  //     }
  //   } catch (err) {
  //     console.error("Error fetching data:", err);
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  // useEffect(() => {
  //   fetchData();
  // }, [fetchData]);
  const fetchData = useCallback(async () => {
    try {
      const userId = sessionStorage.getItem("user_id");
      if (!userId) throw new Error("No user ID found");
  
      const response = await axios.get(`https://gpay-clone.onrender.com/pie-chart-data/${userId}`);
      console.log("API Response:", response.data);
  
      if (!response.data?.data?.length) {
        setData([]);
        setLegendData([]);
        return;
      }
  
      // Calculate total amount
      const totalAmount = response.data.data.reduce((sum, item) => sum + item.amount, 0);
  
      // Group by main category
      const groupedData = response.data.data.reduce((acc, item) => {
        const { label, subcategory, amount, color } = item;
        
        if (!acc[label]) {
          acc[label] = {
            baseColor: color,
            subcategories: [],
            total: 0
          };
        }
  
        // Add subcategory with inherited color shade
        acc[label].subcategories.push({
          name: subcategory || label,
          amount,
          color: color
        });
        acc[label].total += amount;
        
        return acc;
      }, {});
  
      // Create legend data
      const legendItems = Object.entries(groupedData).map(([label, data]) => ({
        name: label,
        color: data.baseColor,
        value: `${label} (${((data.total / totalAmount) * 100).toFixed(1)}%)`,
        total: data.total
      }));
      setLegendData(legendItems);
  
      // Format final data with subcategories
      const formattedData = Object.entries(groupedData).flatMap(([label, data]) => {
        return data.subcategories
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((sub, index) => ({
            name: sub.name,
            value: sub.amount,
            percentage: ((sub.amount / totalAmount) * 100).toFixed(1) + "%",
            color: sub.color,
            mainCategory: label
          }));
      });
  
      console.log("Formatted:", formattedData);
      setData(formattedData);
  
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Handle pie slice hover/click
  const onPieEnter = (_, index) => {
    setActiveIndex(index);

    // Scroll the corresponding table item into view
    const element = document.querySelector(`.pie-label-item[data-unique-id="${index}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    // Set tooltip content only for subcategories
    const hoveredItem = data[index];
    if (hoveredItem) {
      setTooltipContent({
        name: `${hoveredItem.mainCategory} - ${hoveredItem.name}`,
        value: `₹${new Intl.NumberFormat("en-IN").format(hoveredItem.value)}`,
        percentage: hoveredItem.percentage,
        color: hoveredItem.color,
        isDomain: false,
      });
    } else {
      // Clear tooltip for domains
      setTooltipContent(null);
    }
  };

  const onPieLeave = () => {
    setActiveIndex(null);
    setTooltipContent(null); // Clear tooltip
  };

  const handleTableHover = (uniqueId, isDomain, domain, domainTotal, domainPercentage, subcategory, subAmount, subColor) => {
    if (isDomain) {
      // Highlight all subcategories of the domain in the pie chart
      const domainIndices = data
        .map((item, index) => (item.mainCategory === domain ? index : null))
        .filter((index) => index !== null);
      setActiveIndex(domainIndices);

      // Do not set tooltip for the domain
      setTooltipContent(null);
    } else {
      // Highlight only the specific subcategory in the pie chart
      setActiveIndex(data.findIndex((item) => item.name === subcategory && item.mainCategory === domain));

      // Set tooltip for the subcategory
      setTooltipContent({
        name: `${domain} - ${subcategory}`,
        value: `₹${new Intl.NumberFormat("en-IN").format(subAmount)}`,
        percentage: `${data.find((item) => item.name === subcategory)?.percentage}`,
        color: subColor,
        isDomain: false,
      });
    }
  };

  const handleTableLeave = () => {
    setActiveIndex(null);
    setTooltipContent(null); // Clear tooltip
  };

  // Custom active shape when a segment is hovered
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  if (loading) return <p className="loading-message">Loading data...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (data.length === 0) return <p className="no-data-message">No data available for the pie chart.</p>;

  // This is an alternative approach - create a side label list for all segments
  const renderLabelList = () => {
    const groupedByDomain = data.reduce((acc, item) => {
      if (!acc[item.mainCategory]) {
        acc[item.mainCategory] = [];
      }
      acc[item.mainCategory].push(item);
      return acc;
    }, {});

    return (
      <div className="pie-label-list">
        <h3 className="gradient-heading">Expense Details</h3>
        <ul>
          {Object.entries(groupedByDomain).map(([domain, subcategories]) => {
            const domainTotal = subcategories.reduce((sum, sub) => sum + sub.value, 0);
            const domainPercentage = ((domainTotal / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1) + "%";

            return (
              <React.Fragment key={domain}>
                <li
                  className="pie-label-item domain-heading"
                  style={{
                    borderLeft: `16px solid ${subcategories[0].color}`,
                    color: subcategories[0].color,
                    fontWeight: "bold",
                  }}
                  onMouseEnter={() =>
                    handleTableHover(null, true, domain, domainTotal, domainPercentage, null, null, subcategories[0].color)
                  }
                  onMouseLeave={handleTableLeave}
                >
                  <span className="label-name">{domain}</span>
                  <span className="label-value">
                    <span className="percentage">{domainPercentage}</span>
                    <span className="amount">₹{new Intl.NumberFormat("en-IN").format(domainTotal)}</span>
                  </span>
                </li>
                {subcategories.map((item, subIndex) => {
                  console.log("Subcategory Item:", item);
                  return (
                    <li
                      key={`${domain}-${subIndex}`}
                      className={`pie-label-item ${
                        activeIndex === data.findIndex((d) => d.name === item.name && d.mainCategory === domain)
                          ? "active"
                          : ""
                      }`}
                      data-unique-id={data.findIndex((d) => d.name === item.name && d.mainCategory === domain)}
                      style={{
                        borderLeft: `4px solid ${item.color}`,
                        color: item.color,
                      }}
                      onMouseEnter={() =>
                        handleTableHover(
                          data.findIndex((d) => d.name === item.name && d.mainCategory === domain),
                          false,
                          domain,
                          null,
                          null,
                          item.name,
                          item.value,
                          item.color
                        )
                      }
                      onMouseLeave={handleTableLeave}
                    >
                      <span className="label-name">{item.name}</span>
                      <span className="label-value">
                        <span className="percentage">{item.percentage}</span>
                        <span className="amount">₹{new Intl.NumberFormat("en-IN").format(item.value)}</span>
                      </span>
                    </li>
                  );
                })}
              </React.Fragment>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="piechart-container">
      <h2 className="gradient-heading">Spending Breakdown</h2>
      <div className="piechart-content">
        <div className="piechart-wrapper">
          <PieChart width={550} height={400} className="piechart">
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={150}
              fill="#8884d8"
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  style={{ cursor: "pointer" }}
                />
              ))}
            </Pie>
            <Tooltip
              content={
                tooltipContent ? (
                  <div style={{ backgroundColor: tooltipContent.color, padding: "5px", borderRadius: "5px" }}>
                    <p style={{ margin: 0, fontWeight: "bold" }}>{tooltipContent.name}</p>
                    <p style={{ margin: 0 }}>{tooltipContent.value}</p>
                    <p style={{ margin: 0 }}>{tooltipContent.percentage}</p>
                  </div>
                ) : null
              }
            />
            <Legend
              layout="horizontal"
              align="center"
              verticalAlign="bottom"
              payload={Object.entries(data.reduce((acc, item) => {
                if (!acc[item.mainCategory]) {
                  acc[item.mainCategory] = {
                    name: item.mainCategory,
                    color: item.color,
                    value: item.mainCategory
                  };
                }
                return acc;
              }, {})).map(([_, item]) => item)}
              formatter={(value, entry) => (
                <span style={{ color: entry.color, fontWeight: 'bold' }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </div>
        {renderLabelList()}
      </div>
    </div>
  );
};

export default PieChartView;
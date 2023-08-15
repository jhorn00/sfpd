import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./Insights.css";
import { generateBarGraphFields } from "../utils";
import { GeoJsonPoint } from "../types";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

function Insights({ dataPoints }: { dataPoints: GeoJsonPoint[] }) {
  // Modal states
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const barGraphData = generateBarGraphFields(dataPoints); // TODO: I believe when the parent component re-mounts this mounts too

  const data = {
    labels: barGraphData.dates,
    datasets: [
      {
        label: barGraphData.title,
        data: barGraphData.occurrances,
        backgroundColor: "crimson",
        borderColor: "black",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        suggestedMin: 0,
        suggestedMax: 5,
      },
    },
  };

  return (
    <div>
      <Button onClick={handleOpen}>Insights</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div>
            <Bar data={data} options={options} />
          </div>
        </Box>
      </Modal>
    </div>
  );
}

export default Insights;

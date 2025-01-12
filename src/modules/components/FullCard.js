// --- Material Ui Imports --- //
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import {styled} from "@mui/material/styles";

export const FiCard = styled(Card)({
  root: {
    position: "relative"
  }
})

export const FiCardActionArea = styled(CardActionArea)({
  root: {
    position: "relative"
  }
})

export const FiCardActions = styled(CardActions)({
  root: {
    position: "relative"
  }
})

export const FiCardContent = styled(CardContent)({
  root: {
    position: "relative",
    backgroundColor: "transparent"
  }
})

export const FiCardMedia = styled(CardMedia)({
  root: {
    position: "absolute",
    top: 0,
    right: 0,
    height: "100%",
    width: "100%"
  }
})

// --- Exports --- //
export default {
  FiCard,
  FiCardActionArea,
  FiCardActions,
  FiCardContent,
  FiCardMedia
};

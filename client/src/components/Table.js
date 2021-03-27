export default function Table(props) {
  const { data } = props;
  // console.log(data.data, "<<<<<< TABLE");
  return (
    <tr>
      <th scope="row" style={{ color: "#999999" }}>{data.i + 1}</th>
      <td style={{ color: "#999999" }}>{data.data.username}</td>
      <td style={{ color: "#999999" }}>{data.data.eloRating}</td>
    </tr>
  );
}

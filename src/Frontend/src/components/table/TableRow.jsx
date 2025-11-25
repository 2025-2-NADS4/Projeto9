export default function TableRow({ label, before, now, variation, decrease }) {
  return (
    <tr className="border-t border-gray-200">
      <td className="p-3">{label}</td>
      <td className="p-3 text-center">{before}</td>
      <td className="p-3 text-center">{now}</td>
      <td className={`p-3 text-center font-medium ${decrease ? "text-red-500" : "text-green-500"}`}>
        {decrease ? `▼ -${decrease}%` : `▲ +${variation}%`}
      </td>
    </tr>
  );
}

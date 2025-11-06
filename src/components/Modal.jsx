export default function Modal({ title, children, close }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {children}
        <button onClick={close} className="mt-4 w-full border py-2 rounded hover:bg-gray-100">
          Cancel
        </button>
      </div>
    </div>
  );
}

import React, { useContext, useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Spinner from "../components/Spinner";
import ToastContext from "../context/ToastContext";
import { QRCodeCanvas } from "qrcode.react";

const AllContact = () => {
  const { toast } = useContext(ToastContext);

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalData, setModalData] = useState({});
  const [contacts, setContacts] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("name"); // New state for sorting

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/mycontacts`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const result = await res.json();
        if (!result.error) {
          setContacts(result.contacts);
        } else {
          console.log(result);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Sorting logic
  const sortContacts = (contacts) => {
    let sorted = [...contacts];
    if (sortBy === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "email") {
      sorted.sort((a, b) => a.email.localeCompare(b.email));
    }
    return sorted;
  };

  const deleteContact = async (id) => {
    if (window.confirm("are you sure you want to delete this contact ?")) {
      try {
        const res = await fetch(`http://localhost:8000/api/delete/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const result = await res.json();
        if (!result.error) {
          setContacts(result.myContacts);
          toast.success("Deleted contact");
          setShowModal(false);
        } else {
          toast.error(result.error);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const newSearchResults = contacts.filter((contact) => {
      const name = contact.name.toLowerCase();
      const address = contact.address.toLowerCase();
      const email = contact.email.toLowerCase();
      const phone = contact.phone.toString();
      const searchValue = searchInput.toLowerCase();
      return (
        name.includes(searchValue) ||
        address.includes(searchValue) ||
        email.includes(searchValue) ||
        phone.includes(searchValue)
      );
    });
    setContacts(newSearchResults);
  };

  const handleImportVCF = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("vcfFile", file);

    try {
      const res = await fetch("http://localhost:8000/api/import-vcf", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const result = await res.json();
      if (!result.error) {
        toast.success("Contacts imported successfully!");
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      console.error("Error importing VCF", err);
      toast.error("Failed to import contacts.");
    }
  };

  const handleExportVCF = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/export-vcf", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const vcfData = await res.text();
      const blob = new Blob([vcfData], { type: 'text/vcard' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'contacts.vcf';
      a.click();

      toast.success("Contacts exported successfully!");
    } catch (err) {
      console.error("Error exporting VCF", err);
      toast.error("Failed to export contacts.");
    }
  };

  return (
    <>
      <div>
        <h1 className="mt-4">Your Contacts</h1>
        <a href="/mycontacts" className="btn btn-info btn-lg my-2">
          Reload
        </a>
        <a href="/create" className="btn btn-danger btn-lg my-2 mx-2">
          Add
        </a>
        <hr className="my-4" />


        {loading ? (
          <Spinner splash="Loading Contacts..." />
        ) : (
          <>
            {contacts.length === 0 ? (
              <h3>No contacts</h3>
            ) : (
              <>
                <form className="d-flex my-4" onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    name="searchInput"
                    id="searchInput"
                    className="form-control my-2"
                    placeholder="Search name, address, email, phone"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-warning my-2 mx-2">
                    Search
                  </button>
                </form>
                <p className="d-flex justify-content-between align-items-center">
                  <span>
                    Showing Contacts: <strong>{contacts.length}</strong>
                  </span>
                  <div className="btn-group">
                    <label htmlFor="sort" >Sort By: </label>
                    <select
                      className="form-select dropdown-toggle"
                      id="sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="name">Name</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                </p>

                <table className="table table-hover">
                  <thead>
                    <tr className="table-dark">
                      <th scope="col">Name</th>
                      <th scope="col">Address</th>
                      <th scope="col">Email</th>
                      <th scope="col">Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortContacts(contacts).map((contact) => (
                      <tr
                        key={contact._id}
                        onClick={() => {
                          setModalData({});
                          setModalData(contact);
                          setShowModal(true);
                        }}
                      >
                        <td>{contact.name}</td>
                        <td>{contact.address}</td>
                        <td>{contact.email}</td>
                        <td>{contact.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </>
        )}
        <input
          type="file"
          accept=".vcf"
          onChange={handleImportVCF}
          className="btn btn-secondary my-4 mx-2"
        />
        <button className="btn btn-info" onClick={handleExportVCF}>
          Export Contacts
        </button>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header>
          <Modal.Title>{modalData.name}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>
            <strong>Address</strong>: {modalData.address}
          </p>
          <p>
            <strong>Email</strong>: {modalData.email}
          </p>
          <p>
            <strong>Phone Number</strong>: {modalData.phone}
          </p>
          <QRCodeCanvas
            value={`BEGIN:VCARD\nVERSION:4.0\nNAME:${modalData.name}\nEMAIL:${modalData.email}\nPHONE:${modalData.phone}\nEND:VCARD`}
          />
        </Modal.Body>

        <Modal.Footer>
          <Link className="btn btn-info" to={`/edit/${modalData._id}`}>
            Edit
          </Link>
          <button
            className="btn btn-danger"
            onClick={() => deleteContact(modalData._id)}
          >
            Delete
          </button>
          <button
            className="btn btn-warning"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AllContact;

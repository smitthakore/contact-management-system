import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { Modal, Button } from "react-bootstrap";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [contacts, setContacts] = useState([]); // State for all contacts
  const [selectedContacts, setSelectedContacts] = useState([]); // State for selected contacts
  const [showModal, setShowModal] = useState(false); // State to manage modal visibility

  // Redirect if user is not logged in
  useEffect(() => {
    !user && navigate("/login", { replace: true });
  }, []);

  // Fetch contacts when component mounts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/mycontacts", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const result = await res.json();
        if (!result.error) {
          setContacts(result.contacts);
        } else {
          console.error(result);
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    fetchContacts();
  }, []);

  // Handle checkbox change
  const handleCheckboxChange = (contact) => {
    if (selectedContacts.includes(contact)) {
      // Remove contact from selectedContacts if already selected
      setSelectedContacts((prev) =>
        prev.filter((c) => c._id !== contact._id)
      );
    } else {
      // Add contact to selectedContacts
      setSelectedContacts((prev) => [...prev, contact]);
    }
  };

  // Check if contact is selected
  const isContactSelected = (contact) => {
    return selectedContacts.some((selected) => selected._id === contact._id);
  };

  // Open/Close Modal
  const handleModalShow = () => setShowModal(true);
  const handleModalClose = () => setShowModal(false);

  return (
    <>
      <div className="jumbotron">
        <h1>Welcome {user ? user.name : null}</h1>
        <hr className="my-4" />
        
        <a className="btn btn-info btn-lg mx-2" href="/mycontacts" role="button">
          View Contacts
        </a>

        <a className="btn btn-danger btn-lg" href="/create" role="button">
          Add Contacts
        </a>

        {/* Button to show modal */}
        <Button className="btn btn-warning btn-lg mx-2" onClick={handleModalShow}>
            Favourites
        </Button>

        {/* Display selected contacts on the home page */}
        <h3 className="mt-4">Favourite Contacts</h3>
        <ul>
          {selectedContacts.length === 0 ? (
            <p className="text-danger">No contacts selected yet.</p>
          ) : (
            selectedContacts.map((contact) => (

              <ul class="list-group" style={{ maxWidth: "500px" }}>
                <li key={contact._id} class="list-group-item list-group-item-warning d-flex justify-content-between align-items-center my-2">
                      {contact.name}  
                  <span class="badge bg-secondary ms-4 ">{contact.phone}</span>
                  <span class="badge bg-info ms-4 ">{contact.email}</span>
                </li>
              </ul>
            ))
          )}
        </ul>
      </div>

      {/* Modal to select contacts */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Select Contacts</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {contacts.length === 0 ? (
            <p>No contacts available.</p>
          ) : (
            <form>
              {contacts.map((contact) => (
                <div key={contact._id} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={contact._id}
                    checked={isContactSelected(contact)} // Check if contact is selected
                    onChange={() => handleCheckboxChange(contact)}
                  />
                  <label className="form-check-label">
                    {contact.name} - {contact.phone}
                  </label>
                </div>
              ))}
            </form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Home;

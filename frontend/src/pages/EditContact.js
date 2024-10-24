import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import AuthContext from "../context/AuthContext";
import ToastContext from "../context/ToastContext";

const EditContact = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { toast } = useContext(ToastContext);

  const [userDetails, setUserDetails] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setUserDetails({ ...userDetails, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const res = await fetch(`http://localhost:8000/api/contact`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ id, ...userDetails }),
    });
    const result = await res.json();
    if (!result.error) {
      toast.success(`updated [${userDetails.name}] contact`);

      setUserDetails({ name: "", address: "", email: "", phone: "" });
      navigate("/mycontacts");
    } else {
      toast.error(result.error);
    }
  };

  useEffect(() => {
    const fetchContact = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/contact/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const result = await res.json();
        setUserDetails({
          name: result.name,
          email: result.email,
          address: result.address,
          phone: result.phone,
        });
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchContact();
  }, [id]);
  
  return (
    <>
      {loading ? (
        <Spinner splash="Loading Contact..." />
      ) : (
        <>
          <h1 className="mt-4">Edit your contact</h1>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nameInput" className="form-label mt-4">
                Name
              </label>
              <input
                type="text"
                className="form-control"
                id="nameInput"
                name="name"
                value={userDetails.name}
                onChange={handleInputChange}
                placeholder="Alma Shines"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="addressInput" className="form-label mt-4">
                Address
              </label>
              <input
                type="text"
                className="form-control"
                id="addressInput"
                name="address"
                value={userDetails.address}
                onChange={handleInputChange}
                placeholder="Ahmd, Guj"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="emailInput" className="form-label mt-4">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="emailInput"
                name="email"
                value={userDetails.email}
                onChange={handleInputChange}
                placeholder="alma@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phoneInput" className="form-label mt-4">
                Phone Number
              </label>
              <input
                type="number"
                className="form-control"
                id="phoneInput"
                name="phone"
                value={userDetails.phone}
                onChange={handleInputChange}
                placeholder="+977 987654321"
                required
              />
            </div>
            <input
              type="submit"
              value="Save Changes"
              className="btn btn-info mt-4"
            />
          </form>
        </>
      )}
    </>
  );
};

export default EditContact;

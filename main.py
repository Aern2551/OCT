import streamlit as st
from datetime import datetime
from uuid import uuid4
import shutil
import os
from io import BytesIO
from reportlab.pdfgen import canvas
from passlib.context import CryptContext
from dataclasses import dataclass, asdict, field
from typing import Optional, List
def generate_report_pdf(patient_id: str, analysis: Optional[AnalysisResult]) -> BytesIO:
    buffer = BytesIO()
    p = canvas.Canvas(buffer)
    p.drawString(100, 750, f"RetinaView AI Report for Patient {patient_id}")
    if analysis:
        p.drawString(100, 720, f"Diagnosis: {analysis.diagnosis}")
        p.drawString(100, 700, f"Confidence: {analysis.confidence}%")
        if analysis.details:
            p.drawString(100, 680, f"Details: {analysis.details}")
    else:
        p.drawString(100, 720, "No analysis available.")
    p.showPage()
    p.save()
    buffer.seek(0)
    return buffer

# Streamlit app
st.title("RetinaView AI")

if "user" not in st.session_state:
    st.session_state.user = None

def login():
    st.subheader("Login")
    username = st.text_input("Username")
    password = st.text_input("Password", type="password")
    if st.button("Login"):
        user = authenticate_user(username, password)
        if user:
            st.session_state.user = user
            st.success(f"Logged in as {username}")
        else:
            st.error("Invalid username or password")

def logout():
    st.session_state.user = None
    st.success("Logged out")

if st.session_state.user is None:
    login()
else:
    st.sidebar.write(f"Logged in as: {st.session_state.user.username}")
    if st.sidebar.button("Logout"):
        logout()

    menu = st.sidebar.selectbox("Menu", [
        "Create Patient",
        "View Patient",
        "Upload Files",
        "Submit Analysis",
        "View Analysis",
        "Search History",
        "Notifications",
        "Download Report"
    ])

    if menu == "Create Patient":
        st.header("Create Patient")
        with st.form("create_patient_form"):
            patient_id = st.text_input("Patient ID")
            scan_date = st.date_input("Scan Date")
            eye = st.selectbox("Eye", ["left", "right"])
            submitted = st.form_submit_button("Create")
            if submitted:
                if patient_id in patients_db:
                    st.error("Patient already exists")
                else:
                    patient = Patient(patient_id=patient_id, scan_date=datetime.combine(scan_date, datetime.min.time()), eye=eye)
                    patients_db[patient_id] = patient
                    st.success(f"Patient {patient_id} created")

    elif menu == "View Patient":
        st.header("View Patient")
        patient_id = st.text_input("Enter Patient ID")
        if st.button("Get Patient"):
            patient = patients_db.get(patient_id)
            if patient:
                st.json(asdict(patient))
            else:
                st.error("Patient not found")

    elif menu == "Upload Files":
        st.header("Upload Files")
        patient_id = st.text_input("Patient ID for Upload")
        uploaded_files = st.file_uploader("Choose files", accept_multiple_files=True)
        if st.button("Upload"):
            if patient_id not in patients_db:
                st.error("Patient not found")
            elif not uploaded_files:
                st.error("No files selected")
            else:
                patient_folder = os.path.join(UPLOAD_DIR, patient_id)
                os.makedirs(patient_folder, exist_ok=True)
                saved_files = []
                for file in uploaded_files:
                    filename = f"{uuid4().hex}_{file.name}"
                    file_path = os.path.join(patient_folder, filename)
                    with open(file_path, "wb") as f:
                        f.write(file.getbuffer())
                    saved_files.append(filename)
                st.success(f"Uploaded files: {saved_files}")

    elif menu == "Submit Analysis":
        st.header("Submit Analysis")
        with st.form("submit_analysis_form"):
            patient_id = st.text_input("Patient ID")
            diagnosis = st.text_input("Diagnosis")
            confidence = st.number_input("Confidence", min_value=0.0, max_value=100.0, step=0.1)
            details = st.text_area("Details (optional)")
            submitted = st.form_submit_button("Submit")
            if submitted:
                if patient_id not in patients_db:
                    st.error("Patient not found")
                else:
                    analysis = AnalysisResult(patient_id=patient_id, diagnosis=diagnosis, confidence=confidence, details=details)
                    analyses_db[patient_id] = analysis
                    st.success(f"Analysis for patient {patient_id} submitted")

    elif menu == "View Analysis":
        st.header("View Analysis")
        patient_id = st.text_input("Enter Patient ID")
        if st.button("Get Analysis"):
            analysis = analyses_db.get(patient_id)
            if analysis:
                st.json(asdict(analysis))
            else:
                st.error("Analysis not found")

    elif menu == "Search History":
        st.header("Search History")
        patient_id_query = st.text_input("Patient ID contains (optional)")
        diagnosis_query = st.text_input("Diagnosis contains (optional)")
        if st.button("Search"):
            results = []
            for pid, patient in patients_db.items():
                if patient_id_query and patient_id_query.lower() not in pid.lower():
                    continue
                if diagnosis_query:
                    analysis = analyses_db.get(pid)
                    if not analysis or diagnosis_query.lower() not in analysis.diagnosis.lower():
                        continue
                results.append(asdict(patient))
            st.json(results)

    elif menu == "Notifications":
        st.header("Notifications")
        if st.button("Refresh"):
            notifs = [asdict(notif) for notif in notifications_db.values()]
            st.json(notifs)
        with st.form("create_notification_form"):
            message = st.text_input("New Notification Message")
            submitted = st.form_submit_button("Create Notification")
            if submitted:
                notif_id = uuid4().hex
                notification = Notification(id=notif_id, message=message, timestamp=datetime.utcnow())
                notifications_db[notif_id] = notification
                st.success("Notification created")

    elif menu == "Download Report":
        st.header("Download Report")
        patient_id = st.text_input("Patient ID")
        if st.button("Generate Report"):
            if patient_id not in patients_db:
                st.error("Patient not found")
            else:
                analysis = analyses_db.get(patient_id)
                pdf_buffer = generate_report_pdf(patient_id, analysis)
                st.download_button(
                    label="Download PDF Report",
                    data=pdf_buffer,
                    file_name=f"report_{patient_id}.pdf",
                    mime="application/pdf"
                )

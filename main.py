import streamlit as st
from datetime import datetime
from uuid import uuid4
import shutil
import os
from io import BytesIO
from passlib.context import CryptContext
from dataclasses import dataclass, asdict, field
from typing import Optional, List

# ===== OPTION 1: Using WeasyPrint (HTML to PDF) =====
try:
    from weasyprint import HTML, CSS
    WEASYPRINT_AVAILABLE = True
except ImportError:
    WEASYPRINT_AVAILABLE = False

# ===== OPTION 2: Using FPDF =====
try:
    from fpdf import FPDF
    FPDF_AVAILABLE = True
except ImportError:
    FPDF_AVAILABLE = False

# ===== OPTION 3: Using matplotlib for simple reports =====
try:
    import matplotlib.pyplot as plt
    import matplotlib.patches as patches
    from matplotlib.backends.backend_pdf import PdfPages
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False
# ===== PDF Generation Functions =====

def generate_report_pdf_weasyprint(patient_id: str, analysis: Optional[AnalysisResult]) -> BytesIO:
    """Generate PDF using WeasyPrint (HTML to PDF)"""
    if not WEASYPRINT_AVAILABLE:
        raise ImportError("WeasyPrint not available. Install with: pip install weasyprint")
   
    # Create HTML content
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 40px; }}
            .header {{ color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }}
            .content {{ margin-top: 20px; }}
            .diagnosis {{ background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }}
            .confidence {{ color: #27ae60; font-weight: bold; }}
            .details {{ margin-top: 15px; line-height: 1.6; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>RetinaView AI Report</h1>
            <h2>Patient ID: {patient_id}</h2>
            <p>Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        </div>
        <div class="content">
    """
   
    if analysis:
        html_content += f"""
            <div class="diagnosis">
                <h3>Diagnosis: {analysis.diagnosis}</h3>
                <p class="confidence">Confidence: {analysis.confidence}%</p>
                {f'<div class="details"><h4>Details:</h4><p>{analysis.details}</p></div>' if analysis.details else ''}
            </div>
        """
    else:
        html_content += "<p>No analysis available for this patient.</p>"
   
    html_content += """
        </div>
    </body>
    </html>
    """
   
    # Generate PDF
    buffer = BytesIO()
    HTML(string=html_content).write_pdf(buffer)
    buffer.seek(0)
    return buffer

def generate_report_pdf_fpdf(patient_id: str, analysis: Optional[AnalysisResult]) -> BytesIO:
    """Generate PDF using FPDF"""
    if not FPDF_AVAILABLE:
        raise ImportError("FPDF not available. Install with: pip install fpdf2")
   
    pdf = FPDF()
    pdf.add_page()
   
    # Title
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(0, 10, 'RetinaView AI Report', ln=True, align='C')
    pdf.ln(10)
   
    # Patient info
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, f'Patient ID: {patient_id}', ln=True)
    pdf.cell(0, 10, f'Generated on: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}', ln=True)
    pdf.ln(10)
   
    # Analysis results
    if analysis:
        pdf.set_font('Arial', 'B', 12)
        pdf.cell(0, 10, 'Analysis Results:', ln=True)
        pdf.ln(5)
       
        pdf.set_font('Arial', '', 10)
        pdf.cell(0, 10, f'Diagnosis: {analysis.diagnosis}', ln=True)
        pdf.cell(0, 10, f'Confidence: {analysis.confidence}%', ln=True)
       
        if analysis.details:
            pdf.ln(5)
            pdf.cell(0, 10, 'Details:', ln=True)
            pdf.set_font('Arial', '', 9)
            # Split long text into multiple lines
            words = analysis.details.split(' ')
            line = ''
            for word in words:
                if len(line + word) < 80:
                    line += word + ' '
                else:
                    pdf.cell(0, 6, line.strip(), ln=True)
                    line = word + ' '
            if line:
                pdf.cell(0, 6, line.strip(), ln=True)
    else:
        pdf.set_font('Arial', '', 12)
        pdf.cell(0, 10, 'No analysis available for this patient.', ln=True)
   
    # Save to buffer
    buffer = BytesIO()
    pdf_string = pdf.output(dest='S').encode('latin-1')
    buffer.write(pdf_string)
    buffer.seek(0)
    return buffer

def generate_report_pdf_matplotlib(patient_id: str, analysis: Optional[AnalysisResult]) -> BytesIO:
    """Generate PDF using matplotlib"""
    if not MATPLOTLIB_AVAILABLE:
        raise ImportError("Matplotlib not available. Install with: pip install matplotlib")
   
    buffer = BytesIO()
   
    with PdfPages(buffer) as pdf:
        fig, ax = plt.subplots(figsize=(8.5, 11))
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 10)
        ax.axis('off')
       
        # Title
        ax.text(5, 9.5, 'RetinaView AI Report', fontsize=20, fontweight='bold', ha='center')
       
        # Patient info
        ax.text(1, 8.5, f'Patient ID: {patient_id}', fontsize=12, fontweight='bold')
        ax.text(1, 8.2, f'Generated on: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}', fontsize=10)
       
        # Analysis results
        if analysis:
            ax.text(1, 7.5, 'Analysis Results:', fontsize=14, fontweight='bold')
            ax.text(1, 7.0, f'Diagnosis: {analysis.diagnosis}', fontsize=12)
            ax.text(1, 6.7, f'Confidence: {analysis.confidence}%', fontsize=12)
           
            if analysis.details:
                ax.text(1, 6.2, 'Details:', fontsize=12, fontweight='bold')
                # Wrap text
                words = analysis.details.split(' ')
                lines = []
                current_line = ''
                for word in words:
                    if len(current_line + word) < 70:
                        current_line += word + ' '
                    else:
                        lines.append(current_line.strip())
                        current_line = word + ' '
                if current_line:
                    lines.append(current_line.strip())
               
                y_pos = 5.8
                for line in lines:
                    ax.text(1, y_pos, line, fontsize=10)
                    y_pos -= 0.3
        else:
            ax.text(1, 7.5, 'No analysis available for this patient.', fontsize=12)
       
        # Add a border
        border = patches.Rectangle((0.5, 0.5), 9, 9, linewidth=2, edgecolor='black', facecolor='none')
        ax.add_patch(border)
       
        pdf.savefig(fig, bbox_inches='tight')
        plt.close(fig)
   
    buffer.seek(0)
    return buffer

# Main PDF generation function with fallback
def generate_report_pdf(patient_id: str, analysis: Optional[AnalysisResult]) -> BytesIO:
    """Generate PDF using available library (with fallback order)"""
   
    # Try WeasyPrint first (best quality)
    if WEASYPRINT_AVAILABLE:
        try:
            return generate_report_pdf_weasyprint(patient_id, analysis)
        except Exception as e:
            st.warning(f"WeasyPrint failed: {e}")
   
    # Try FPDF second (good balance)
    if FPDF_AVAILABLE:
        try:
            return generate_report_pdf_fpdf(patient_id, analysis)
        except Exception as e:
            st.warning(f"FPDF failed: {e}")
   
    # Try matplotlib last (basic but reliable)
    if MATPLOTLIB_AVAILABLE:
        try:
            return generate_report_pdf_matplotlib(patient_id, analysis)
        except Exception as e:
            st.warning(f"Matplotlib failed: {e}")
   
    # If all fail, create a simple text-based PDF using basic HTML
    st.error("No PDF libraries available. Please install one of: weasyprint, fpdf2, or matplotlib")
    return BytesIO()

# Streamlit app
st.title("RetinaView AI")

# Show available PDF libraries
st.sidebar.write("PDF Libraries Available:")
st.sidebar.write(f"• WeasyPrint: {'✓' if WEASYPRINT_AVAILABLE else '✗'}")
st.sidebar.write(f"• FPDF: {'✓' if FPDF_AVAILABLE else '✗'}")
st.sidebar.write(f"• Matplotlib: {'✓' if MATPLOTLIB_AVAILABLE else '✗'}")
                try:
                    analysis = analyses_db.get(patient_id)
                    pdf_buffer = generate_report_pdf(patient_id, analysis)
                   
                    if pdf_buffer.getvalue():  # Check if PDF was generated
                        st.download_button(
                            label="Download PDF Report",
                            data=pdf_buffer,
                            file_name=f"report_{patient_id}.pdf",
                            mime="application/pdf"
                        )
                    else:
                        st.error("Could not generate PDF. Please install a PDF library.")
                except Exception as e:
                    st.error(f"Error generating report: {str(e)}")

# Installation instructions
st.sidebar.markdown("---")
st.sidebar.markdown("**Installation Commands:**")
st.sidebar.code("pip install weasyprint", language="bash")
st.sidebar.code("pip install fpdf2", language="bash")
st.sidebar.code("pip install matplotlib", language="bash")

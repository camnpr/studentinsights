class ServiceTypesController < ApplicationController
  # Used to supply valid service type names to the service upload page.

  # Authentication by default inherited from ApplicationController.

  before_action :authorize_for_districtwide_access_admin, only: [:is_service_working]

  def authorize_for_districtwide_access_admin
    unless current_educator.admin? && current_educator.districtwide_access?
      render json: { error: "You don't have the correct authorization." }
    end
  end

  def index
    render json: ServiceType.pluck(:name).sort
  end

  def is_service_working_json
    attendance_officer = ServiceType.find(502)
    student_ids = attendance_officer.services
                                    .where('date_started > ?', Time.current - 1.year)
                                    .map(&:student_id)

    chart_data = Student.where(id: student_ids).map do |student|
      {
        student: student,
        services: student.services.where(service_type_id: 502),
        absences: student.absences.order(occurred_at: :desc),
        tardies: student.tardies.order(occurred_at: :desc)
      }
    end

    render json: {
      chart_data: chart_data
    }
  end

  def is_service_working
    render 'shared/serialized_data'
  end

end

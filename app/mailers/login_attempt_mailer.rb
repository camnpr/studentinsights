class LoginAttemptMailer < ActionMailer::Base

  def notify(educator)
    @target_emails = ENV['LOGIN_ATTEMPT_MAILER_LIST'].split(',')
    @timespan = Educator::FAILED_LOGIN_NOTIFY_TIMESPAN
    @educator = educator

    @failed_login_attempts = @educator.failed_login_attempts.order(created_at: :desc)
    @subject = "Failed Logins for #{@educator.full_name_or_login} (#{PerDistrict.new.district_key})"

    mail(
      to: @target_emails,
      subject: @subject,
      from: "Student Insights LoginAttemptMailer <asoble@gmail.com>"
    )
  end

end

class CreateFailedLoginAttempts < ActiveRecord::Migration[5.1]
  def change
    create_table :failed_login_attempts do |t|
      t.belongs_to :educator

      t.timestamps
    end
  end
end

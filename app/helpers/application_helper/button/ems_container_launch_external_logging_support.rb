class ApplicationHelper::Button::EmsContainerLaunchExternalLoggingSupport < ApplicationHelper::Button::GenericFeatureButton
  def initialize(view_context, instance_data, props)
    props ||= {}
    props.store_path(:options, :feature, :external_logging)

    super
  end

  def disabled?
    ems = @record.ext_management_system
    route_name = ems.external_logging_route_name
    disabled = !visible? || ContainerRoute.find_by(:name   => route_name,
                                                   :ems_id => ems.id).blank?
    @error_message = _("A route named '%{route_name}' is configured to connect to the " \
                       "external logging server but it doesn't exist") % {:route_name => route_name} if disabled
    disabled
  end
end
